"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFService = void 0;
const pdf_lib_1 = require("pdf-lib");
const fs_1 = __importDefault(require("fs"));
class PDFService {
    // Merge multiple PDFs
    static async mergePDFs(filePaths) {
        const mergedPdf = await pdf_lib_1.PDFDocument.create();
        for (const filePath of filePaths) {
            const pdfBytes = fs_1.default.readFileSync(filePath);
            const pdf = await pdf_lib_1.PDFDocument.load(pdfBytes);
            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            pages.forEach(page => mergedPdf.addPage(page));
        }
        const mergedPdfBytes = await mergedPdf.save();
        return Buffer.from(mergedPdfBytes);
    }
    // Split PDF into multiple files
    static async splitPDF(filePath, pagesPerSplit) {
        const pdfBytes = fs_1.default.readFileSync(filePath);
        const pdf = await pdf_lib_1.PDFDocument.load(pdfBytes);
        const totalPages = pdf.getPageCount();
        const result = [];
        for (let i = 0; i < totalPages; i += pagesPerSplit) {
            const newPdf = await pdf_lib_1.PDFDocument.create();
            const end = Math.min(i + pagesPerSplit, totalPages);
            for (let j = i; j < end; j++) {
                const [page] = await newPdf.copyPages(pdf, [j]);
                newPdf.addPage(page);
            }
            const newPdfBytes = await newPdf.save();
            result.push(Buffer.from(newPdfBytes));
        }
        return result;
    }
    // Compress PDF (simplified - just re-save)
    static async compressPDF(filePath) {
        const pdfBytes = fs_1.default.readFileSync(filePath);
        const pdf = await pdf_lib_1.PDFDocument.load(pdfBytes);
        const compressedBytes = await pdf.save();
        return Buffer.from(compressedBytes);
    }
    // Extract PDF info (simplified version without pdf-parse)
    static async getPDFInfo(filePath) {
        const pdfBytes = fs_1.default.readFileSync(filePath);
        const pdf = await pdf_lib_1.PDFDocument.load(pdfBytes);
        return {
            numPages: pdf.getPageCount(),
            info: "PDF information extracted",
            note: "Install pdf-parse for more detailed information"
        };
    }
    // Convert images to PDF (basic implementation)
    static async imagesToPDF(imagePaths) {
        const pdfDoc = await pdf_lib_1.PDFDocument.create();
        for (const imgPath of imagePaths) {
            const imageBytes = fs_1.default.readFileSync(imgPath);
            let image;
            if (imgPath.endsWith(".jpg") || imgPath.endsWith(".jpeg")) {
                image = await pdfDoc.embedJpg(imageBytes);
            }
            else if (imgPath.endsWith(".png")) {
                image = await pdfDoc.embedPng(imageBytes);
            }
            else {
                throw new Error("Unsupported image format");
            }
            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
            });
        }
        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);
    }
}
exports.PDFService = PDFService;
