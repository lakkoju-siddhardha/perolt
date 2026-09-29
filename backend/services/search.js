const pool = require("../config/database");
const { generateEmbedding } = require("./embeddings");
const { rerankChunks } = require("./reranker");


function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


function getWordSet(text) {
    return new Set(
        normalizeText(text)
            .split(" ")
            .filter(Boolean)
    );
}


function calculateOverlap(textA, textB) {
    const wordsA = getWordSet(textA);
    const wordsB = getWordSet(textB);

    if (wordsA.size === 0 || wordsB.size === 0) {
        return 0;
    }

    let commonWords = 0;

    for (const word of wordsA) {
        if (wordsB.has(word)) {
            commonWords++;
        }
    }

    return commonWords / Math.min(wordsA.size, wordsB.size);
}


function removeDuplicateChunks(chunks, limit) {
    const selected = [];

    for (const chunk of chunks) {

        const isDuplicate = selected.some((existing) => {
            const overlap = calculateOverlap(
                chunk.content,
                existing.content
            );

            return overlap >= 0.75;
        });

        if (!isDuplicate) {
            selected.push(chunk);
        }

        if (selected.length >= limit) {
            break;
        }
    }

    return selected;
}


async function searchSimilarChunks(query, limit = 5) {

    // ========================================
    // Step 1: Generate query embedding
    // ========================================

    const queryEmbedding = await generateEmbedding(query);

    const vector = `[${queryEmbedding.join(",")}]`;


    // ========================================
    // Step 2: Retrieve candidate chunks
    // ========================================

    const candidateLimit = Math.max(limit * 2, 10);

    const result = await pool.query(
        `
        SELECT
            chunks.id,
            chunks.document_id,
            chunks.chunk_index,
            chunks.content,
            documents.filename,
            1 - (chunks.embedding <=> $1::vector) AS similarity
        FROM chunks
        JOIN documents
            ON documents.id = chunks.document_id
        WHERE chunks.embedding IS NOT NULL
        ORDER BY chunks.embedding <=> $1::vector
        LIMIT $2
        `,
        [vector, candidateLimit]
    );


    // ========================================
    // Step 3: Rerank candidates
    // ========================================

  console.time("⏱️ Reranker");

const rerankedChunks = await rerankChunks(
    query,
    result.rows
);

console.timeEnd("⏱️ Reranker");
 
// ========================================
// Step 3.5: Filter weak matches
// ========================================

const MIN_RERANK_SCORE = -2;
console.log(
    "🔎 Reranker scores:",
    rerankedChunks.map((chunk) => ({
        score: Number(chunk.rerankScore.toFixed(3)),
        chunk: chunk.chunk_index
    }))
);
const relevantChunks = rerankedChunks.filter(
    (chunk) => chunk.rerankScore >= MIN_RERANK_SCORE
);

    // ========================================
    // Step 4: Remove duplicate chunks
    // ========================================

    const finalChunks = removeDuplicateChunks(
    relevantChunks,
    limit
);


    // ========================================
    // Step 5: Return best chunks
    // ========================================

    return finalChunks;
}


module.exports = {
    searchSimilarChunks
};