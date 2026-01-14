"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFService = void 0;
const pdf_lib_1 = require("pdf-lib");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Poppler = require("pdf-poppler");
class PDFService {
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
    static async compressPDF(filePath) {
        const pdfBytes = fs_1.default.readFileSync(filePath);
        const pdf = await pdf_lib_1.PDFDocument.load(pdfBytes);
        const compressedBytes = await pdf.save();
        return Buffer.from(compressedBytes);
    }
    static async getPDFInfo(filePath) {
        const pdfBytes = fs_1.default.readFileSync(filePath);
        const pdf = await pdf_lib_1.PDFDocument.load(pdfBytes);
        return {
            numPages: pdf.getPageCount(),
            info: "PDF information extracted",
            note: "Install pdf-parse for more detailed information"
        };
    }
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
                height: image.height
            });
        }
        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);
    }
    static async convertPDFToImages(filePath, options = {}) {
        const { format = "png", quality = 100, scale = 2, pages = "all" } = options;
        const outputDir = path_1.default.join(__dirname, "../../uploads/converted_images");
        if (!fs_1.default.existsSync(outputDir)) {
            fs_1.default.mkdirSync(outputDir, { recursive: true });
        }
        const baseFileName = path_1.default.basename(filePath, ".pdf");
        const timestamp = Date.now();
        let pageNumbers = [];
        if (pages === "all") {
            const pdfBytes = fs_1.default.readFileSync(filePath);
            const pdf = await pdf_lib_1.PDFDocument.load(pdfBytes);
            const totalPages = pdf.getPageCount();
            pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        else {
            const pdfBytes = fs_1.default.readFileSync(filePath);
            const pdf = await pdf_lib_1.PDFDocument.load(pdfBytes);
            const totalPages = pdf.getPageCount();
            pageNumbers = pages.filter(page => page >= 1 && page <= totalPages);
        }
        const opts = {
            format: format === "jpeg" ? "jpeg" : "png",
            out_dir: outputDir,
            out_prefix: `${baseFileName}_${timestamp}_page`,
            page: pageNumbers.length === 1 ? pageNumbers[0] : null,
            scale: scale * 100,
            quality: quality
        };
        try {
            await Poppler.convert(filePath, opts);
            const results = [];
            const files = fs_1.default.readdirSync(outputDir);
            const pattern = new RegExp(`${baseFileName}_${timestamp}_page`);
            for (const file of files) {
                if (pattern.test(file)) {
                    results.push(path_1.default.join(outputDir, file));
                }
            }
            return results.sort();
        }
        catch (error) {
            console.error("PDF to images conversion error:", error);
            throw new Error(`Failed to convert PDF to images: ${error.message}`);
        }
    }
    static async convertPDFToText(filePath) {
        return new Promise((resolve, reject) => {
            try {
                const PDFParser = require("pdf2json");
                const pdfParser = new PDFParser();
                let extractedText = "";
                pdfParser.on("pdfParser_dataError", (error) => {
                    console.error("PDF parsing error:", error);
                    reject(new Error(`Failed to parse PDF: ${error.parserError}`));
                });
                pdfParser.on("pdfParser_dataReady", (pdfData) => {
                    try {
                        if (!pdfData.Pages || pdfData.Pages.length === 0) {
                            extractedText = "No text content found in PDF.";
                            resolve(extractedText);
                            return;
                        }
                        extractedText = pdfData.Pages.map((page, pageIndex) => {
                            if (!page.Texts || page.Texts.length === 0) {
                                return `Page ${pageIndex + 1}: No text found`;
                            }
                            const pageText = page.Texts
                                .map((textObj) => {
                                try {
                                    return decodeURIComponent(textObj.R[0].T);
                                }
                                catch (e) {
                                    return textObj.R[0].T || "";
                                }
                            })
                                .join(" ")
                                .replace(/\s+/g, " ")
                                .trim();
                            return `Page ${pageIndex + 1}:\n${pageText}`;
                        }).join("\n\n");
                        if (!extractedText || extractedText.trim().length === 0) {
                            extractedText = "No extractable text found in PDF. This may be a scanned/image PDF.";
                        }
                        resolve(extractedText);
                    }
                    catch (parseError) {
                        reject(new Error(`Failed to extract text: ${parseError.message}`));
                    }
                });
                pdfParser.loadPDF(filePath);
            }
            catch (error) {
                reject(new Error(`PDF processing failed: ${error.message}`));
            }
        });
    }
    static async splitPDFByRanges(filePath, ranges) {
        const pdfBytes = fs_1.default.readFileSync(filePath);
        const pdf = await pdf_lib_1.PDFDocument.load(pdfBytes);
        const totalPages = pdf.getPageCount();
        const pageNumbers = this.parseRangeString(ranges, totalPages);
        const result = [];
        const groups = this.groupConsecutivePages(pageNumbers);
        for (const group of groups) {
            const newPdf = await pdf_lib_1.PDFDocument.create();
            const copiedPages = await newPdf.copyPages(pdf, group);
            copiedPages.forEach(page => newPdf.addPage(page));
            const newPdfBytes = await newPdf.save();
            result.push(Buffer.from(newPdfBytes));
        }
        return result;
    }
    static parseRangeString(rangeStr, totalPages) {
        const pages = [];
        const parts = rangeStr.split(",");
        for (const part of parts) {
            const trimmed = part.trim();
            if (!trimmed) {
                continue;
            }
            if (trimmed.includes("-")) {
                const [startStr, endStr] = trimmed.split("-");
                const start = Math.max(1, parseInt(startStr, 10));
                const end = endStr ? Math.min(parseInt(endStr, 10), totalPages) : start;
                if (isNaN(start) || isNaN(end) || start > end) {
                    continue;
                }
                for (let i = start; i <= end; i++) {
                    const pageIndex = i - 1;
                    if (i <= totalPages && !pages.includes(pageIndex)) {
                        pages.push(pageIndex);
                    }
                }
            }
            else {
                const pageNum = parseInt(trimmed, 10);
                if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                    const pageIndex = pageNum - 1;
                    if (!pages.includes(pageIndex)) {
                        pages.push(pageIndex);
                    }
                }
            }
        }
        return pages.sort((a, b) => a - b);
    }
    static groupConsecutivePages(pages) {
        if (pages.length === 0) {
            return [];
        }
        const groups = [];
        let currentGroup = [pages[0]];
        for (let i = 1; i < pages.length; i++) {
            if (pages[i] === pages[i - 1] + 1) {
                currentGroup.push(pages[i]);
            }
            else {
                groups.push([...currentGroup]);
                currentGroup = [pages[i]];
            }
        }
        if (currentGroup.length > 0) {
            groups.push(currentGroup);
        }
        return groups;
    }
}
exports.PDFService = PDFService;
//# sourceMappingURL=pdfService.js.map