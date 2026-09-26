
const {
    createDocument,
    createChunk,
    getDocuments
} = require("../models/documentModel");
const express = require("express");
const multer = require("multer");

const { extractText } = require("../services/documentParser");
const { chunkText } = require("../services/chunker");
const { answerQuestion } = require("../services/rag");
const { generateEmbedding } = require("../services/embeddings");

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {
        const filename =
            Date.now() + "-" + file.originalname;

        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: function (req, file, cb) {

        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"));
        }
    }
});

router.post("/upload", upload.single("document"), async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a PDF"
            });
        }

        const result = await extractText(req.file.path);
        const chunks = chunkText(result.text);

        const document = await createDocument(
    req.file.originalname,
    req.file.size,
    result.pages
);

for (let i = 0; i < chunks.length; i++) {

    console.log(
        `Generating embedding ${i + 1}/${chunks.length}`
    );

    const embedding = await generateEmbedding(
        chunks[i].text
    );

    await createChunk(
        document.id,
        i,
        chunks[i].text,
        chunks[i].start,
        chunks[i].end,
        embedding
    );
}

       res.json({
    success: true,

    document: {
        name: req.file.originalname,
        size: req.file.size,
        pages: result.pages
    },

    totalChunks: chunks.length,

    chunks: chunks.slice(0, 5)
});

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "PDF processing failed",
            error: error.message
        });
    }
});
router.post("/ask", async (req, res) => {

    try {

        const { question } = req.body;

        if (!question || question.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Question is required"
            });
        }

        const result = await answerQuestion(question);

        res.json({
            success: true,
            question: question,
            answer: result.answer,
            sources: result.sources
        });

    } catch (error) {

        console.error("Question answering failed:");
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to answer question",
            error: error.message
        });
    }
});
router.get("/", async (req, res) => {

    try {

        const documents = await getDocuments();

        res.json({
            success: true,
            documents: documents
        });

    } catch (error) {

        console.error("Failed to fetch documents:");
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch documents",
            error: error.message
        });
    }
});
module.exports = router;