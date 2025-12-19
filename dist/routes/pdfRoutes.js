"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pdfController_1 = require("../controllers/pdfController");
const fileHandler_1 = require("../utils/fileHandler");
const router = (0, express_1.Router)();
// PDF Operations
router.post("/merge", fileHandler_1.upload.array("files", 10), pdfController_1.PDFController.merge);
router.post("/split", fileHandler_1.upload.single("file"), pdfController_1.PDFController.split);
router.post("/compress", fileHandler_1.upload.single("file"), pdfController_1.PDFController.compress);
router.post("/info", fileHandler_1.upload.single("file"), pdfController_1.PDFController.getInfo);
// NEW: Conversion Features
router.post("/convert-to-images", fileHandler_1.upload.single("file"), pdfController_1.PDFController.convertToImages);
router.post("/convert-to-text", fileHandler_1.upload.single("file"), pdfController_1.PDFController.convertToText);
router.post("/split-by-ranges", fileHandler_1.upload.single("file"), pdfController_1.PDFController.splitByRanges);
// Health check
router.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "PDF API is operational",
        endpoints: {
            merge: "POST /api/pdf/merge",
            split: "POST /api/pdf/split",
            compress: "POST /api/pdf/compress",
            info: "POST /api/pdf/info",
            convertToImages: "POST /api/pdf/convert-to-images",
            convertToText: "POST /api/pdf/convert-to-text",
            splitByRanges: "POST /api/pdf/split-by-ranges",
            health: "GET /api/pdf/health"
        }
    });
});
exports.default = router;
