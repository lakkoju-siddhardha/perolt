const { searchSimilarChunks } = require("./search");

async function answerQuestion(question) {

    // 1. Find relevant chunks
    const chunks = await searchSimilarChunks(question, 5);

    if (chunks.length === 0) {
        return {
            answer: "I couldn't find relevant information in your documents.",
            sources: []
        };
    }

    // 2. Build context
    const context = chunks
        .map((chunk, index) => {
            return `SOURCE ${index + 1}:\n${chunk.content}`;
        })
        .join("\n\n");

    // 3. Ask Ollama directly
    const response = await fetch(
        "http://127.0.0.1:11434/api/generate",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "qwen3.5:4b",

                prompt: `
You are KnowVault, a document question-answering assistant.

Use ONLY the document context below to answer the question.

If the answer is not present in the context, say:
"I couldn't find this information in your uploaded documents."

Do not invent information.

DOCUMENT CONTEXT:

${context}

QUESTION:

${question}

ANSWER:
`,

                stream: false,

                // Don't spend a long time on hidden reasoning
                think: false,

                options: {
                    temperature: 0.2,
                    num_predict: 300
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

    return {
        answer: data.response,
       sources: chunks.map(chunk => ({
    chunkId: chunk.id,
    documentId: chunk.document_id,
    filename: chunk.filename,
    similarity: chunk.similarity,
    content: chunk.content
}))
    };
}

module.exports = {
    answerQuestion
};