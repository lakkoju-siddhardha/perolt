const { searchSimilarChunks } = require("./services/search");

async function test() {

    try {

        const query = "What is a proposition?";

        console.log("Searching for:");
        console.log(query);
        console.log("\n");

        const results = await searchSimilarChunks(query, 5);

        console.log(`Found ${results.length} results:\n`);

        results.forEach((result, index) => {

            console.log(`========== RESULT ${index + 1} ==========`);

            console.log("Chunk ID:", result.id);
            console.log("Document ID:", result.document_id);
            console.log("Similarity:", result.similarity);

            console.log("\nContent:");
            console.log(result.content);

            console.log("\n");
        });

    } catch (error) {

        console.error("Search failed:");
        console.error(error.message);

    }
}

test();