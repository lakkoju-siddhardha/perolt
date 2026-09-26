const { answerQuestion } = require("./services/rag");

async function test() {

    try {

        const question = "What is a proposition?";

        console.log("Question:");
        console.log(question);

        console.log("\nThinking...\n");

        const result = await answerQuestion(question);

        console.log("ANSWER:");
        console.log(result.answer);

        console.log("\nSOURCES:");

        result.sources.forEach((source, index) => {
            console.log(
                `${index + 1}. Chunk ${source.chunkId} | Similarity: ${source.similarity}`
            );
        });

    }  catch (error) {

    console.error("RAG failed:");
    console.error(error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

}
}

test();