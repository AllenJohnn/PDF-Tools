"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFController = void 0;
const pdfService_1 = require("../services/pdfService");
const fs_1 = __importDefault(require("fs"));
class PDFController {
    static async merge(req, res) {
        try {
            const files = req.files;
            const filePaths = files.map(file => file.path);
            const mergedPDF = await pdfService_1.PDFService.mergePDFs(filePaths);
            // Clean up temp files
            filePaths.forEach(filePath => {
                if (fs_1.default.existsSync(filePath))
                    fs_1.default.unlinkSync(filePath);
            });
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=merged.pdf");
            res.send(mergedPDF);
        }
        catch (error) {
            console.error("Merge error:", error);
            res.status(500).json({ error: "Failed to merge PDFs" });
        }
    }
    static async split(req, res) {
        try {
            const file = req.file;
            const { pagesPerSplit = 1 } = req.body;
            const splitPDFs = await pdfService_1.PDFService.splitPDF(file.path, parseInt(pagesPerSplit));
            // Clean up temp file
            if (fs_1.default.existsSync(file.path))
                fs_1.default.unlinkSync(file.path);
            if (splitPDFs.length === 1) {
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", "attachment; filename=split.pdf");
                res.send(splitPDFs[0]);
            }
            else {
                // Send as zip in production
                res.json({
                    message: `PDF split into ${splitPDFs.length} files`,
                    files: splitPDFs.map((pdf, index) => ({
                        data: pdf.toString("base64"),
                        filename: `split-part-${index + 1}.pdf`
                    }))
                });
            }
        }
        catch (error) {
            console.error("Split error:", error);
            res.status(500).json({ error: "Failed to split PDF" });
        }
    }
    static async compress(req, res) {
        try {
            const file = req.file;
            const compressedPDF = await pdfService_1.PDFService.compressPDF(file.path);
            // Clean up temp file
            if (fs_1.default.existsSync(file.path))
                fs_1.default.unlinkSync(file.path);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=compressed.pdf");
            res.send(compressedPDF);
        }
        catch (error) {
            console.error("Compress error:", error);
            res.status(500).json({ error: "Failed to compress PDF" });
        }
    }
    static async getInfo(req, res) {
        try {
            const file = req.file;
            const info = await pdfService_1.PDFService.getPDFInfo(file.path);
            // Clean up temp file
            if (fs_1.default.existsSync(file.path))
                fs_1.default.unlinkSync(file.path);
            res.json({
                ...info,
                message: "Basic PDF info extracted. Install pdf-parse for detailed text extraction."
            });
        }
        catch (error) {
            console.error("Info error:", error);
            res.status(500).json({ error: "Failed to get PDF info" });
        }
    }
}
exports.PDFController = PDFController;
