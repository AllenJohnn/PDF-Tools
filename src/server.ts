import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import PDFMerger from "pdf-merger-js";
import { PDFDocument } from "pdf-lib";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 5000;

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
        const timestamp = Date.now();
        const originalName = file.originalname.replace(/\s+/g, "_");
        cb(null, `${timestamp}-${originalName}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"));
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024
    }
});

// PDF Merge endpoint
app.post("/api/pdf/merge", upload.array("pdfs"), async (req: Request, res: Response) => {
    try {
        console.log("📥 Merge request received");
        
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
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
            
            // Cleanup temporary files
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

// PDF Compress endpoint
app.post("/api/pdf/compress", upload.single("pdf"), async (req: Request, res: Response) => {
    try {
        console.log("📥 Compress request received");
        
        const file = req.file;
        
        if (!file) {
            return res.status(400).json({ 
                error: "No file uploaded",
                message: "Please select a PDF file to compress"
            });
        }

        console.log(`📄 Compressing PDF: ${file.originalname}`);
        
        // Read the PDF file
        const pdfBytes = fs.readFileSync(file.path);
        
        // Load the PDF document
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        // Create a new PDF for compression
        const compressedPdf = await PDFDocument.create();
        
        // Copy all pages
        const pages = await compressedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach(page => compressedPdf.addPage(page));
        
        // Remove metadata to reduce size
        compressedPdf.setTitle("Compressed PDF");
        compressedPdf.setAuthor("");
        compressedPdf.setSubject("");
        compressedPdf.setKeywords([]);
        compressedPdf.setProducer("");
        compressedPdf.setCreator("");
        
        // Save with compression options
        const compressedPdfBytes = await compressedPdf.save({
            useObjectStreams: true,
            addDefaultPage: false,
            objectsPerTick: 100,
            updateFieldAppearances: false
        });
        
        // Generate output filename
        const outputFilename = `compressed-${Date.now()}.pdf`;
        const outputPath = path.join(uploadsDir, outputFilename);
        
        // Write compressed PDF to file
        fs.writeFileSync(outputPath, compressedPdfBytes);
        
        const originalSize = fs.statSync(file.path).size;
        const compressedSize = fs.statSync(outputPath).size;
        const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        
        console.log(`✅ PDF compressed successfully: ${outputFilename}`);
        console.log(`📊 Size: ${(originalSize / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB (${reduction}% reduction)`);

        // Send the compressed file
        res.download(outputPath, `compressed-${file.originalname}`, (err) => {
            if (err) {
                console.error("❌ Error sending file:", err);
            }
            
            // Cleanup temporary files
            try {
                fs.unlink(file.path, () => {});
                fs.unlink(outputPath, () => {});
                console.log("🧹 Temporary files cleaned up");
            } catch (cleanupErr) {
                console.error("Error during cleanup:", cleanupErr);
            }
        });

    } catch (error: any) {
        console.error("❌ Compress error:", error);
        res.status(500).json({ 
            error: "Failed to compress PDF",
            message: error.message || "Unknown error occurred"
        });
    }
});

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
    res.json({ 
        status: "OK", 
        message: "PDF Processor is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
    });
});

// PDF API health check
app.get("/api/pdf/health", (req: Request, res: Response) => {
    res.json({ 
        status: "OK", 
        message: "PDF API is operational",
        endpoints: {
            merge: "POST /api/pdf/merge",
            compress: "POST /api/pdf/compress",
            health: "GET /api/pdf/health"
        }
    });
});

// Serve index.html for all other routes
app.get("*", (req: Request, res: Response) => {
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
    console.log(`📦 Compress PDF: POST http://localhost:${PORT}/api/pdf/compress`);
    console.log(`📁 Uploads dir: ${uploadsDir}`);
    console.log(`===========================================\n`);
});