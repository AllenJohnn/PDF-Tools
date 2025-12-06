"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const pdf_merger_js_1 = __importDefault(require("pdf-merger-js"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000; // Changed from 3000 to 5000
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve static files from public folder
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
// Create uploads directory if it doesn't exist
const uploadsDir = path_1.default.join(__dirname, "..", "uploads");
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Keep original filename with timestamp
        const timestamp = Date.now();
        const originalName = file.originalname.replace(/\s+/g, "_");
        cb(null, `${timestamp}-${originalName}`);
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Only accept PDF files
        if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
            cb(null, true);
        }
        else {
            cb(new Error("Only PDF files are allowed"));
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});
// PDF Merge endpoint
app.post("/api/pdf/merge", upload.array("pdfs"), async (req, res) => {
    try {
        console.log("📥 Merge request received");
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: "No files uploaded",
                message: "Please select at least one PDF file"
            });
        }
        const files = req.files;
        console.log(`📄 Processing ${files.length} PDF file(s):`);
        files.forEach(file => console.log(`   - ${file.originalname}`));
        // Merge PDFs
        const merger = new pdf_merger_js_1.default();
        for (const file of files) {
            await merger.add(file.path);
        }
        // Generate output filename
        const outputFilename = `merged-${Date.now()}.pdf`;
        const outputPath = path_1.default.join(uploadsDir, outputFilename);
        // Save merged PDF
        await merger.save(outputPath);
        console.log(`✅ PDF merged successfully: ${outputFilename}`);
        // Send the merged file
        res.download(outputPath, "merged.pdf", (err) => {
            if (err) {
                console.error("❌ Error sending file:", err);
            }
            // Cleanup: Delete temporary files after sending
            try {
                files.forEach(file => {
                    fs_1.default.unlink(file.path, () => { });
                });
                fs_1.default.unlink(outputPath, () => { });
                console.log("🧹 Temporary files cleaned up");
            }
            catch (cleanupErr) {
                console.error("Error during cleanup:", cleanupErr);
            }
        });
    }
    catch (error) {
        console.error("❌ Merge error:", error);
        res.status(500).json({
            error: "Failed to merge PDFs",
            message: error.message || "Unknown error occurred"
        });
    }
});
// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "PDF Processor is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
    });
});
// PDF API health check
app.get("/api/pdf/health", (req, res) => {
    res.json({
        status: "OK",
        message: "PDF API is operational",
        endpoints: {
            merge: "POST /api/pdf/merge",
            health: "GET /api/pdf/health"
        }
    });
});
// Serve index.html for all other routes
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../public", "index.html"));
});
// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 ========================================`);
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📄 Frontend:    http://localhost:${PORT}`);
    console.log(`🔧 API Health:  http://localhost:${PORT}/api/health`);
    console.log(`📄 PDF Health:  http://localhost:${PORT}/api/pdf/health`);
    console.log(`📤 Merge PDF:   POST http://localhost:${PORT}/api/pdf/merge`);
    console.log(`📁 Uploads dir: ${uploadsDir}`);
    console.log(`===========================================\n`);
});
