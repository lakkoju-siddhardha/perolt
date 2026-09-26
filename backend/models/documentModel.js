const pool = require("../config/database");

async function createDocument(
    filename,
    fileSize,
    totalPages,
    fileHash
) {
    const result = await pool.query(
        `
        INSERT INTO documents
            (
                filename,
                file_size,
                total_pages,
                file_hash
            )
        VALUES
            ($1, $2, $3, $4)
        RETURNING *
        `,
        [
            filename,
            fileSize,
            totalPages,
            fileHash
        ]
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
async function getDocumentById(documentId) {
    const result = await pool.query(
        `
        SELECT
            id,
            filename,
            file_size,
            total_pages,
            created_at
        FROM documents
        WHERE id = $1
        `,
        [documentId]
    );

    return result.rows[0] || null;
}

async function getDocumentChunks(documentId) {
    const result = await pool.query(
        `
        SELECT
            id,
            document_id,
            chunk_index,
            content,
            start_position,
            end_position
        FROM chunks
        WHERE document_id = $1
        ORDER BY chunk_index ASC
        `,
        [documentId]
    );

    return result.rows;
}
async function updateDocumentSummary(
    documentId,
    summary,
    status = "completed"
) {
    const result = await pool.query(
        `
        UPDATE documents
        SET
            summary = $1,
            summary_status = $2
        WHERE id = $3
        RETURNING *
        `,
        [
            summary,
            status,
            documentId
        ]
    );

    return result.rows[0] || null;
}

async function getDocumentSummary(documentId) {
    const result = await pool.query(
        `
        SELECT
            id,
            filename,
            summary,
            summary_status
        FROM documents
        WHERE id = $1
        `,
        [documentId]
    );

    return result.rows[0] || null;
}
async function getDocumentByHash(fileHash) {
    const result = await pool.query(
        `
        SELECT
            id,
            filename,
            file_size,
            total_pages,
            created_at,
            summary,
            summary_status
        FROM documents
        WHERE file_hash = $1
        `,
        [fileHash]
    );

    return result.rows[0] || null;
}
module.exports = {
    createDocument,
    createChunk,
    getDocuments,
    getDocumentById,
    getDocumentChunks,
    updateDocumentSummary,
    getDocumentSummary,
    getDocumentByHash
};