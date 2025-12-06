import express from "express";
import cors from "cors";
import multer from "multer";
import PDFMerger from "pdf-merger-js";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 5000; // Changed from 3000 to 5000

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "../public")));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
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

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Only accept PDF files
        if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
            cb(null, true);
        } else {
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

        const files = req.files as Express.Multer.File[];
        console.log(`📄 Processing ${files.length} PDF file(s):`);
        files.forEach(file => console.log(`   - ${file.originalname}`));

        // Merge PDFs
        const merger = new PDFMerger();
        
        for (const file of files) {
            await merger.add(file.path);
        }

        // Generate output filename
        const outputFilename = `merged-${Date.now()}.pdf`;
        const outputPath = path.join(uploadsDir, outputFilename);
        
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
                    fs.unlink(file.path, () => {});
                });
                fs.unlink(outputPath, () => {});
                console.log("🧹 Temporary files cleaned up");
            } catch (cleanupErr) {
                console.error("Error during cleanup:", cleanupErr);
            }
        });

    } catch (error: any) {
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
    res.sendFile(path.join(__dirname, "../public", "index.html"));
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