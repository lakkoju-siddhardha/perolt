const pool = require("../config/database");

async function createDocument(filename, fileSize, totalPages) {

    const result = await pool.query(
        `
        INSERT INTO documents
            (filename, file_size, total_pages)
        VALUES
            ($1, $2, $3)
        RETURNING *
        `,
        [filename, fileSize, totalPages]
    );

    return result.rows[0];
}


async function createChunk(
    documentId,
    chunkIndex,
    content,
    startPosition,
    endPosition,
    embedding
) {

    const vector = `[${embedding.join(",")}]`;

    const result = await pool.query(
        `
        INSERT INTO chunks
            (
                document_id,
                chunk_index,
                content,
                start_position,
                end_position,
                embedding
            )
        VALUES
            ($1, $2, $3, $4, $5, $6::vector)
        RETURNING *
        `,
        [
            documentId,
            chunkIndex,
            content,
            startPosition,
            endPosition,
            vector
        ]
    );

    return result.rows[0];
}
async function getDocuments() {

    const result = await pool.query(`
        SELECT
            d.id,
            d.filename,
            d.file_size,
            d.total_pages,
            d.created_at,
            COUNT(c.id)::INTEGER AS total_chunks,
            COUNT(c.embedding)::INTEGER AS embedded_chunks
        FROM documents d
        LEFT JOIN chunks c
            ON c.document_id = d.id
        GROUP BY
            d.id
        ORDER BY
            d.created_at DESC
    `);

    return result.rows;
}

module.exports = {
    createDocument,
    createChunk,
    getDocuments
};