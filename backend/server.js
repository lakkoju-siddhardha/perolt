const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const documentRoutes = require("./routes/documentRoutes");

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "perolt API is running 🚀"
    });
});

app.use("/api/documents", documentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
const pool = require("./config/database");

async function testDatabase() {
    try {
        const result = await pool.query("SELECT NOW()");
        console.log("🗄️ Database time:", result.rows[0].now);
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
    }
}

testDatabase();