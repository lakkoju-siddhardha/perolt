
const {
    createDocument,
    createChunk,
    getDocuments,
    getDocumentByHash,
    updateDocumentSummary
} = require("../models/documentModel");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const multer = require("multer");

const { extractText } = require("../services/documentParser");
const { chunkText } = require("../services/chunker");
const {
    answerQuestion,
    summarizeDocument
} = require("../services/rag");
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

        const fileBuffer = fs.readFileSync(req.file.path);

const fileHash = crypto
    .createHash("sha256")
    .update(fileBuffer)
    .digest("hex");

const existingDocument = await getDocumentByHash(fileHash);

if (existingDocument) {

    fs.unlinkSync(req.file.path);

    return res.status(409).json({
        success: false,
        duplicate: true,
        message: "This document has already been uploaded.",
        document: {
            id: existingDocument.id,
            name: existingDocument.filename,
            pages: existingDocument.total_pages
        }
    });
}

const result = await extractText(req.file.path);
const chunks = chunkText(result.text);

        const document = await createDocument(
    req.file.originalname,
    req.file.size,
    result.pages,
    fileHash
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

    await updateDocumentSummary(
    document.id,
    null,
    "generating"
);

res.json({
    success: true,

    document: {
        id: document.id,
        name: req.file.originalname,
        size: req.file.size,
        pages: result.pages
    },

    totalChunks: chunks.length,

    chunks: chunks.slice(0, 5),

    summaryStatus: "generating"
});

// Generate the document summary in the background.
// The upload response has already been sent to the frontend.
setImmediate(async () => {
    try {
        console.log(
            `Generating summary for document ${document.id}...`
        );

        const summary = await summarizeDocument(
            document,
            chunks
        );

        await updateDocumentSummary(
            document.id,
            summary,
            "completed"
        );

        console.log(
            `✅ Summary generated for document ${document.id}`
        );

    } catch (error) {

        console.error(
            `❌ Summary generation failed for document ${document.id}:`
        );

        console.error(error);

        try {
            await updateDocumentSummary(
                document.id,
                null,
                "failed"
            );
        } catch (updateError) {
            console.error(
                "Failed to update summary status:",
                updateError
            );
        }
    }
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