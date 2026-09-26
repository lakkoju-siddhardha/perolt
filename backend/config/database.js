const { Pool } = require("pg");

const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "knowvault",
    password: "knowvault123",
    database: "knowvault"
});

pool.on("connect", () => {
    console.log("🐘 PostgreSQL connected");
});

pool.on("error", (err) => {
    console.error("PostgreSQL error:", err);
});

module.exports = pool;