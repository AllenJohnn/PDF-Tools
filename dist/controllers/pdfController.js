"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFController = void 0;
const pdfService_1 = require("../services/pdfService");
const logger_1 = __importDefault(require("../utils/logger"));
const response_1 = require("../utils/response");
const fs_1 = __importDefault(require("fs"));
class PDFController {
    static async merge(req, res) {
        try {
            const files = req.files;
            const filePaths = files.map(file => file.path);
            logger_1.default.info(`Merging ${files.length} PDF files`);
            const mergedPDF = await pdfService_1.PDFService.mergePDFs(filePaths);
            filePaths.forEach(filePath => {
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
            });
            logger_1.default.info(`Successfully merged ${files.length} PDFs`);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=merged.pdf");
            res.send(mergedPDF);
        }
        catch (error) {
            logger_1.default.error("Merge error:", error);
            (0, response_1.errorResponse)(res, 500, "Failed to merge PDFs", error);
        }
    }
    static async split(req, res) {
        try {
            const file = req.file;
            const { pagesPerSplit = 1 } = req.body;
            logger_1.default.info(`Splitting PDF: ${file.filename} with ${pagesPerSplit} pages per split`);
            const splitPDFs = await pdfService_1.PDFService.splitPDF(file.path, parseInt(pagesPerSplit));
            if (fs_1.default.existsSync(file.path)) {
                fs_1.default.unlinkSync(file.path);
            }
            if (splitPDFs.length === 1) {
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", "attachment; filename=split.pdf");
                res.send(splitPDFs[0]);
            }
            else {
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
            if (fs_1.default.existsSync(file.path)) {
                fs_1.default.unlinkSync(file.path);
            }
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
            if (fs_1.default.existsSync(file.path)) {
                fs_1.default.unlinkSync(file.path);
            }
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
    static async convertToImages(req, res) {
        try {
            const file = req.file;
            const { format = "png", scale = "2", pages = "all", quality = "100" } = req.body;
            if (!["png", "jpeg", "jpg"].includes(format)) {
                return res.status(400).json({ error: "Format must be png, jpeg, or jpg" });
            }
            let pageArray = "all";
            if (pages !== "all") {
                try {
                    pageArray = JSON.parse(pages);
                    if (!Array.isArray(pageArray)) {
                        throw new Error("Pages must be an array");
                    }
                }
                catch (e) {
                    return res.status(400).json({ error: "Invalid pages format. Use 'all' or array like [1,2,3]" });
                }
            }
            const imagePaths = await pdfService_1.PDFService.convertPDFToImages(file.path, {
                format: format,
                scale: parseInt(scale),
                quality: parseInt(quality),
                pages: pageArray
            });
            if (fs_1.default.existsSync(file.path)) {
                fs_1.default.unlinkSync(file.path);
            }
            if (imagePaths.length === 1) {
                const imageExt = format === "jpeg" ? "jpg" : format;
                res.setHeader("Content-Type", `image/${imageExt}`);
                res.setHeader("Content-Disposition", `attachment; filename=converted.${imageExt}`);
                res.sendFile(imagePaths[0], () => {
                    if (fs_1.default.existsSync(imagePaths[0])) {
                        fs_1.default.unlinkSync(imagePaths[0]);
                    }
                });
            }
            else {
                res.json({
                    message: `PDF converted to ${imagePaths.length} images`,
                    images: imagePaths.map((imagePath, index) => ({
                        filename: `page-${index + 1}.${format === "jpeg" ? "jpg" : format}`,
                        path: imagePath.replace(/^.*[\\\/]/, "")
                    })),
                    note: "In production, consider zipping multiple images for download"
                });
                setTimeout(() => {
                    imagePaths.forEach(imagePath => {
                        if (fs_1.default.existsSync(imagePath)) {
                            fs_1.default.unlinkSync(imagePath);
                        }
                    });
                }, 1000);
            }
        }
        catch (error) {
            console.error("Convert to images error:", error);
            const file = req.file;
            if (file?.path && fs_1.default.existsSync(file.path)) {
                fs_1.default.unlinkSync(file.path);
            }
            if (error.message.includes("poppler") || error.message.includes("PDFPage")) {
                res.status(500).json({
                    error: "PDF to image conversion requires poppler-utils. Install with: brew install poppler (macOS) or sudo apt-get install poppler-utils (Linux)"
                });
            }
            else {
                res.status(500).json({ error: `Failed to convert PDF to images: ${error.message}` });
            }
        }
    }
    static async convertToText(req, res) {
        try {
            const file = req.file;
            const text = await pdfService_1.PDFService.convertPDFToText(file.path);
            if (fs_1.default.existsSync(file.path)) {
                fs_1.default.unlinkSync(file.path);
            }
            if (req.headers.accept?.includes("text/plain")) {
                res.setHeader("Content-Type", "text/plain");
                res.setHeader("Content-Disposition", "attachment; filename=extracted.txt");
                res.send(text);
            }
            else {
                res.json({
                    text: text,
                    characterCount: text.length,
                    wordCount: text.split(/\s+/).filter(word => word.length > 0).length,
                    note: "Text extracted successfully"
                });
            }
        }
        catch (error) {
            console.error("Convert to text error:", error);
            const file = req.file;
            if (file?.path && fs_1.default.existsSync(file.path)) {
                fs_1.default.unlinkSync(file.path);
            }
            res.status(500).json({ error: `Failed to extract text: ${error.message}` });
        }
    }
    static async splitByRanges(req, res) {
        try {
            const file = req.file;
            const { ranges } = req.body;
            if (!ranges || typeof ranges !== "string") {
                return res.status(400).json({
                    error: "Missing or invalid 'ranges' parameter. Format: '1-5,7,9-12'"
                });
            }
            const splitPDFs = await pdfService_1.PDFService.splitPDFByRanges(file.path, ranges);
            if (fs_1.default.existsSync(file.path)) {
                fs_1.default.unlinkSync(file.path);
            }
            if (splitPDFs.length === 1) {
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", "attachment; filename=split.pdf");
                res.send(splitPDFs[0]);
            }
            else {
                res.json({
                    message: `PDF split into ${splitPDFs.length} files`,
                    ranges: ranges,
                    files: splitPDFs.map((pdf, index) => ({
                        data: pdf.toString("base64"),
                        filename: `split-range-${index + 1}.pdf`,
                        size: pdf.length
                    }))
                });
            }
        }
        catch (error) {
            console.error("Split by ranges error:", error);
            const file = req.file;
            if (file?.path && fs_1.default.existsSync(file.path)) {
                fs_1.default.unlinkSync(file.path);
            }
            res.status(500).json({ error: `Failed to split PDF: ${error.message}` });
        }
    }
    static async imagesToPDF(req, res) {
        try {
            const files = req.files;
            if (!files || files.length === 0) {
                return res.status(400).json({ error: "No image files provided" });
            }
            const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp"];
            for (const file of files) {
                const ext = file.originalname.toLowerCase().slice(-4);
                if (!validExtensions.some(e => ext.endsWith(e))) {
                    files.forEach(f => {
                        if (fs_1.default.existsSync(f.path)) {
                            fs_1.default.unlinkSync(f.path);
                        }
                    });
                    return res.status(400).json({
                        error: `Invalid file type: ${file.originalname}. Supported: JPG, PNG, GIF, BMP`
                    });
                }
            }
            const imagePaths = files.map(f => f.path);
            const pdfBuffer = await pdfService_1.PDFService.imagesToPDF(imagePaths);
            imagePaths.forEach(imagePath => {
                if (fs_1.default.existsSync(imagePath)) {
                    fs_1.default.unlinkSync(imagePath);
                }
            });
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=images.pdf");
            res.send(pdfBuffer);
        }
        catch (error) {
            console.error("Images to PDF error:", error);
            const files = req.files;
            if (files) {
                files.forEach(f => {
                    if (fs_1.default.existsSync(f.path)) {
                        fs_1.default.unlinkSync(f.path);
                    }
                });
            }
            res.status(500).json({ error: `Failed to create PDF from images: ${error.message}` });
        }
    }
}
exports.PDFController = PDFController;
//# sourceMappingURL=pdfController.js.map