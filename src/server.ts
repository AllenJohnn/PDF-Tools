import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";

// Import your modular routes and controllers
import pdfRoutes from "./routes/pdfRoutes";
import { upload } from "./utils/fileHandler";
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

// Create converted_images subdirectory
const convertedImagesDir = path.join(uploadsDir, "converted_images");
if (!fs.existsSync(convertedImagesDir)) {
    fs.mkdirSync(convertedImagesDir, { recursive: true });
}

// Serve uploads directory
app.use("/uploads", express.static(uploadsDir));

// Use modular routes - THIS IS THE KEY CHANGE!
app.use("/api/pdf", pdfRoutes);

// Global health check
app.get("/api/health", (req: express.Request, res: express.Response) => {
    res.json({ 
        status: "OK", 
        message: "PDF Processor is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
    });
});

// Serve index.html for the frontend
app.get("/", (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("❌ Server error:", err);
    res.status(500).json({ 
        error: "Internal server error",
        message: err.message || "Something went wrong"
    });
});

// 404 handler
app.use("*", (req: express.Request, res: express.Response) => {
    res.status(404).json({ 
        error: "Not Found",
        message: `Route ${req.originalUrl} not found`
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 ========================================`);
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📄 Frontend:    http://localhost:${PORT}`);
    console.log(`🔧 API Health:  http://localhost:${PORT}/api/health`);
    console.log(`📄 PDF Health:  http://localhost:${PORT}/api/pdf/health`);
    console.log(`📁 Uploads dir: ${uploadsDir}`);
    console.log(`📁 Converted images: ${convertedImagesDir}`);
    console.log(`===========================================\n`);
});