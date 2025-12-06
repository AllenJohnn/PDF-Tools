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
// Health check
router.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "PDF Processor API is running",
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
