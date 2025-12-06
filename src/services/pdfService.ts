import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";

export class PDFService {
  
  // Merge multiple PDFs
  static async mergePDFs(filePaths: string[]): Promise<Buffer> {
    const mergedPdf = await PDFDocument.create();
    
    for (const filePath of filePaths) {
      const pdfBytes = fs.readFileSync(filePath);
      const pdf = await PDFDocument.load(pdfBytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(page => mergedPdf.addPage(page));
    }
    
    const mergedPdfBytes = await mergedPdf.save();
    return Buffer.from(mergedPdfBytes);
  }

  // Split PDF into multiple files
  static async splitPDF(filePath: string, pagesPerSplit: number): Promise<Buffer[]> {
    const pdfBytes = fs.readFileSync(filePath);
    const pdf = await PDFDocument.load(pdfBytes);
    const totalPages = pdf.getPageCount();
    const result: Buffer[] = [];

    for (let i = 0; i < totalPages; i += pagesPerSplit) {
      const newPdf = await PDFDocument.create();
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
  static async compressPDF(filePath: string): Promise<Buffer> {
    const pdfBytes = fs.readFileSync(filePath);
    const pdf = await PDFDocument.load(pdfBytes);
    const compressedBytes = await pdf.save();
    return Buffer.from(compressedBytes);
  }

  // Extract PDF info (simplified version without pdf-parse)
  static async getPDFInfo(filePath: string): Promise<any> {
    const pdfBytes = fs.readFileSync(filePath);
    const pdf = await PDFDocument.load(pdfBytes);
    
    return {
      numPages: pdf.getPageCount(),
      info: "PDF information extracted",
      note: "Install pdf-parse for more detailed information"
    };
  }

  // Convert images to PDF (basic implementation)
  static async imagesToPDF(imagePaths: string[]): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    
    for (const imgPath of imagePaths) {
      const imageBytes = fs.readFileSync(imgPath);
      let image;
      
      if (imgPath.endsWith(".jpg") || imgPath.endsWith(".jpeg")) {
        image = await pdfDoc.embedJpg(imageBytes);
      } else if (imgPath.endsWith(".png")) {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
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
