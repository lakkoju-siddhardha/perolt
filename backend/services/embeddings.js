const http = require("http");

function generateEmbedding(text) {
    return new Promise((resolve, reject) => {

        const data = JSON.stringify({
            text: text
        });

        const options = {
            hostname: "127.0.0.1",
            port: 8000,
            path: "/embed",
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
                            new Error(result.message || "Embedding failed")
                        );
                    }

                    resolve(result.embedding);

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
    generateEmbedding
};