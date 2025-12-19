"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Import your modular routes and controllers
const pdfRoutes_1 = __importDefault(require("./routes/pdfRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
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
// Create converted_images subdirectory
const convertedImagesDir = path_1.default.join(uploadsDir, "converted_images");
if (!fs_1.default.existsSync(convertedImagesDir)) {
    fs_1.default.mkdirSync(convertedImagesDir, { recursive: true });
}
// Serve uploads directory
app.use("/uploads", express_1.default.static(uploadsDir));
// Use modular routes - THIS IS THE KEY CHANGE!
app.use("/api/pdf", pdfRoutes_1.default);
// Global health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "PDF Processor is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
    });
});
// Serve index.html for the frontend
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../public", "index.html"));
});
// Global error handler
app.use((err, req, res, next) => {
    console.error("❌ Server error:", err);
    res.status(500).json({
        error: "Internal server error",
        message: err.message || "Something went wrong"
    });
});
// 404 handler
app.use("*", (req, res) => {
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
