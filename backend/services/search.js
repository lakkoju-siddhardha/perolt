const pool = require("../config/database");
const { generateEmbedding } = require("./embeddings");

function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getWordSet(text) {
    return new Set(normalizeText(text).split(" ").filter(Boolean));
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
console.timeEnd("⏱️ PostgreSQL search");
    return selected;
    
}

async function searchSimilarChunks(query, limit = 5) {
    console.time("⏱️ Query embedding");

const queryEmbedding = await generateEmbedding(query);

console.timeEnd("⏱️ Query embedding");

    const vector = `[${queryEmbedding.join(",")}]`;

    const candidateLimit = Math.max(limit * 3, 15);
 console.time("⏱️ PostgreSQL search");
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

    return removeDuplicateChunks(
        result.rows,
        limit
    );
}

module.exports = {
    searchSimilarChunks
};