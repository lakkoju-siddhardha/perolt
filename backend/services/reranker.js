const http = require("http");

function rerankChunks(query, chunks) {
    return new Promise((resolve, reject) => {
        const documents = chunks.map((chunk) => chunk.content);

        const data = JSON.stringify({
            query,
            documents
        });

        const options = {
            hostname: "127.0.0.1",
            port: 8000,
            path: "/rerank",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data)
            }
        };

        const req = http.request(options, (res) => {
            let body = "";

            res.on("data", (chunk) => {
                body += chunk;
            });

            res.on("end", () => {
                try {
                    const result = JSON.parse(body);

                    if (!result.success) {
                        return reject(
                            new Error(result.message || "Reranking failed")
                        );
                    }

                    const rerankedChunks = result.results
                        .map((item) => ({
                            ...chunks[item.index],
                            rerankScore: item.score
                        }))
                        .sort((a, b) => b.rerankScore - a.rerankScore);

                    resolve(rerankedChunks);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on("error", (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

module.exports = {
    rerankChunks
};