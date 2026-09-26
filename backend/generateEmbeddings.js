const pool = require("./config/database");
const { generateEmbedding } = require("./services/embeddings");

async function generateAllEmbeddings() {
    try {
        console.log("Fetching chunks without embeddings...");

        const result = await pool.query(`
            SELECT id, content
            FROM chunks
            WHERE embedding IS NULL
            ORDER BY id
        `);

        const chunks = result.rows;

        console.log(`Found ${chunks.length} chunks.`);

        for (let i = 0; i < chunks.length; i++) {

            const chunk = chunks[i];

            console.log(
                `Processing ${i + 1}/${chunks.length} - Chunk ID: ${chunk.id}`
            );

            const embedding = await generateEmbedding(chunk.content);

            const vector = `[${embedding.join(",")}]`;

            await pool.query(
                `
                UPDATE chunks
                SET embedding = $1::vector
                WHERE id = $2
                `,
                [vector, chunk.id]
            );

            console.log(`✅ Saved embedding for chunk ${chunk.id}`);
        }

        console.log("🎉 All embeddings generated successfully!");

    } catch (error) {

        console.error("❌ Embedding generation failed:");
        console.error(error.message);

    } finally {

        await pool.end();
    }
}

generateAllEmbeddings();