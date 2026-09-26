const { generateEmbedding } = require("./services/embeddings");

async function test() {
    try {
        const embedding = await generateEmbedding(
            "A proposition is a declarative statement that is either true or false."
        );

        console.log("Embedding generated successfully!");
        console.log("Dimensions:", embedding.length);
        console.log("First 10 values:", embedding.slice(0, 10));

    } catch (error) {
        console.error("Embedding failed:");
        console.error(error.message);
    }
}

test();