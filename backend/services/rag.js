const { searchSimilarChunks } = require("./search");
const {
    getDocuments,
    getDocumentChunks
} = require("../models/documentModel");

function findMentionedDocument(question, documents) {
    const questionText = question.toLowerCase();

    const matches = documents
        .map((document) => {
            const filename = document.filename.toLowerCase();

            const filenameWithoutExtension = filename
                .replace(/\.[^/.]+$/, "");

            const words = filenameWithoutExtension
                .split(/[\s_-]+/)
                .filter((word) => word.length >= 2);

            const matchedWords = words.filter((word) =>
                questionText.includes(word)
            );

            return {
                document,
                score: matchedWords.length
            };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score);

    return matches.length > 0
        ? matches[0].document
        : null;
}

function detectIntent(question) {
    const text = question.toLowerCase().trim();

    if (
        /summari[sz]e|summary|overview|key points|main points|important points|whole document|entire document/i.test(
            text
        )
    ) {
        return "summary";
    }

    if (
        /explain more|explain further|more detail|in detail|elaborate|expand|give more information|tell me more/i.test(
            text
        )
    ) {
        return "explain";
    }

    if (
        /outside the document|outside document|general knowledge|using general knowledge|not from the document|external knowledge/i.test(
            text
        )
    ) {
        return "outside";
    }

    return "question";
}

async function callOllama(prompt, numPredict = 500) {
    const response = await fetch(
        "http://127.0.0.1:11434/api/generate",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "qwen3.5:4b",
                prompt,
                stream: false,
                think: false,
                options: {
                    temperature: 0.2,
                    num_predict: numPredict
                }
            })
        }
    );

    if (!response.ok) {
        throw new Error(
            `Ollama returned HTTP ${response.status}`
        );
    }

    const data = await response.json();

    return data.response;
}

async function summarizeDocument(document, chunks) {
    const BATCH_SIZE = 16;
    const batchSummaries = [];

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(
            i,
            i + BATCH_SIZE
        );

        const context = batch
            .map(
                (chunk) =>
                    `CHUNK ${chunk.chunk_index}:\n${chunk.content}`
            )
            .join("\n\n");

        console.log(
            `Summarizing ${i + 1}-${Math.min(
                i + BATCH_SIZE,
                chunks.length
            )} of ${chunks.length} chunks`
        );

        const summary = await callOllama(
            `
You are Perolt, a document summarization assistant.

Summarize ONLY the information contained in the
document passages below.

Do not add outside knowledge.
Do not invent information.

Focus on:
- important concepts
- definitions
- explanations
- examples
- formulas
- important facts

Write a useful study-oriented summary.
Do not make it extremely short.

DOCUMENT:
${document.filename}

PASSAGES:

${context}

SUMMARY:
`,
            500
        );

        batchSummaries.push(summary);
    }

    const combinedSummaries = batchSummaries
        .map(
            (summary, index) =>
                `SECTION SUMMARY ${index + 1}:\n${summary}`
        )
        .join("\n\n");

    const finalSummary = await callOllama(
        `
You are Perolt.

Create a complete, well-structured summary of the
document using the section summaries below.

Document:
${document.filename}

Your final answer should:

1. Start with a short overview.
2. Organize the important topics using Markdown headings.
3. Explain the major concepts clearly.
4. Include important definitions.
5. Include important examples when present.
6. Include formulas or logical expressions when present.
7. End with a section called "Key Takeaways".
8. Do not add information that is not present in the
   supplied summaries.

This is a DOCUMENT SUMMARY, so do not reduce the
entire document to only 4-5 sentences.

SECTION SUMMARIES:

${combinedSummaries}

FINAL SUMMARY:
`,
        1200
    );

    return finalSummary;
}

async function answerQuestion(question) {
    const intent = detectIntent(question);

    console.log(`RAG intent: ${intent}`);

    // --------------------------------------------------
    // WHOLE DOCUMENT SUMMARY
    // --------------------------------------------------

    if (intent === "summary") {
        const documents = await getDocuments();

        if (documents.length === 0) {
            return {
                answer:
                    "I don't have any uploaded documents to summarize.",
                sources: []
            };
        }

       

  let document;

if (documents.length === 1) {
    document = documents[0];
} else {
    const mentionedDocument = findMentionedDocument(
        question,
        documents
    );

    if (!mentionedDocument) {
        return {
            answer:
                "I found multiple documents. Please mention the document name you want me to use.",
            sources: documents.map((document) => ({
                documentId: document.id,
                filename: document.filename,
                similarity: null,
                content: ""
            }))
        };
    }

    document = mentionedDocument;
}


        const chunks = await getDocumentChunks(
            document.id
        );

        if (chunks.length === 0) {
            return {
                answer:
                    "I found the document, but it does not contain any processed text yet.",
                sources: []
            };
        }

        const answer = await summarizeDocument(
            document,
            chunks
        );

        return {
            answer,
            sources: chunks.slice(0, 5).map((chunk) => ({
                chunkId: chunk.id,
                documentId: chunk.document_id,
                filename: document.filename,
                similarity: null,
                content: chunk.content
            }))
        };
    }

    // --------------------------------------------------
    // NORMAL / EXPLAIN / OUTSIDE KNOWLEDGE
    // --------------------------------------------------

    const chunks = await searchSimilarChunks(
        question,
        intent === "explain" ? 8 : 5
    );

    if (chunks.length === 0) {
        return {
            answer:
                "I couldn't find relevant information in your uploaded documents.",
            sources: []
        };
    }

    const context = chunks
        .map((chunk, index) => {
            return `
SOURCE ${index + 1}
DOCUMENT: ${chunk.filename}
CHUNK: ${chunk.chunk_index}

${chunk.content}
`;
        })
        .join("\n\n");

    let prompt;

    if (intent === "outside") {
        prompt = `
You are Perolt, an AI document assistant.

The user explicitly asked for information beyond
the uploaded documents.

Use the uploaded document context when it is useful,
but you may also use your general knowledge.

Clearly distinguish:
- information found in the uploaded document
- additional general knowledge

Do not pretend outside knowledge came from the document.

DOCUMENT CONTEXT:

${context}

QUESTION:

${question}

ANSWER:
`;
    } else if (intent === "explain") {
        prompt = `
You are Perolt, an AI document assistant.

The user wants a more detailed explanation.

Use ONLY the uploaded document context.

Explain the topic thoroughly and clearly.

Include when relevant:
- definition
- concept
- step-by-step explanation
- examples
- formulas or logical notation
- important related ideas

Do not invent information that is not supported
by the document.

DOCUMENT CONTEXT:

${context}

QUESTION:

${question}

DETAILED EXPLANATION:
`;
    } else {
        prompt = `
You are Perolt, a document question-answering assistant.

Use ONLY the uploaded document context to answer
the question.

If the answer is not present in the context, say:

"I couldn't find this information in your uploaded documents."

Do not invent information.

Give a clear answer with enough explanation to be
useful, but do not unnecessarily make it very long.

DOCUMENT CONTEXT:

${context}

QUESTION:

${question}

ANSWER:
`;
    }

    const answer = await callOllama(
        prompt,
        intent === "explain" ? 800 : 500
    );

    return {
        answer,
        sources: chunks.map((chunk) => ({
            chunkId: chunk.id,
            documentId: chunk.document_id,
            filename: chunk.filename,
            similarity: chunk.similarity,
            content: chunk.content
        }))
    };
}

module.exports = {
    answerQuestion,
    detectIntent
};