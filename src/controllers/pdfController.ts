import { Request, Response } from "express";
import { PDFService } from "../services/pdfService";
import logger from "../utils/logger";
import { errorResponse, successResponse } from "../utils/response";
import fs from "fs";

interface MulterRequest extends Request {
  files?: Express.Multer.File[];
  file?: Express.Multer.File;
}

export class PDFController {
  static async merge(req: Request, res: Response) {
    try {
      const files = (req as MulterRequest).files!;
      const filePaths = files.map(file => file.path);

      logger.info(`Merging ${files.length} PDF files`);
      const mergedPDF = await PDFService.mergePDFs(filePaths);

      filePaths.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      logger.info(`Successfully merged ${files.length} PDFs`);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=merged.pdf");
      res.send(mergedPDF);
    } catch (error: any) {
      logger.error("Merge error:", error);
      errorResponse(res, 500, "Failed to merge PDFs", error);
    }
  }

  static async split(req: Request, res: Response) {
    try {
      const file = (req as MulterRequest).file!;
      const { pagesPerSplit = 1 } = req.body;

      logger.info(`Splitting PDF: ${file.filename} with ${pagesPerSplit} pages per split`);
      const splitPDFs = await PDFService.splitPDF(file.path, parseInt(pagesPerSplit));

      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      if (splitPDFs.length === 1) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=split.pdf");
        res.send(splitPDFs[0]);
      } else {
        res.json({
          message: `PDF split into ${splitPDFs.length} files`,
          files: splitPDFs.map((pdf, index) => ({
            data: pdf.toString("base64"),
            filename: `split-part-${index + 1}.pdf`
          }))
        });
      }
    } catch (error: any) {
      console.error("Split error:", error);
      res.status(500).json({ error: "Failed to split PDF" });
    }
  }

  static async compress(req: Request, res: Response) {
    try {
      const file = (req as MulterRequest).file!;
      const compressedPDF = await PDFService.compressPDF(file.path);

      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=compressed.pdf");
      res.send(compressedPDF);
    } catch (error: any) {
      console.error("Compress error:", error);
      res.status(500).json({ error: "Failed to compress PDF" });
    }
  }

  static async getInfo(req: Request, res: Response) {
    try {
      const file = (req as MulterRequest).file!;
      const info = await PDFService.getPDFInfo(file.path);

      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      res.json({
        ...info,
        message: "Basic PDF info extracted. Install pdf-parse for detailed text extraction."
      });
    } catch (error: any) {
      console.error("Info error:", error);
      res.status(500).json({ error: "Failed to get PDF info" });
    }
  }

  static async convertToImages(req: Request, res: Response) {
    try {
      const file = (req as MulterRequest).file!;
      const {
        format = "png",
        scale = "2",
        pages = "all",
        quality = "100"
      } = req.body;

      if (!["png", "jpeg", "jpg"].includes(format)) {
        return res.status(400).json({ error: "Format must be png, jpeg, or jpg" });
      }

      let pageArray: number[] | "all" = "all";
      if (pages !== "all") {
        try {
          pageArray = JSON.parse(pages);
          if (!Array.isArray(pageArray)) {
            throw new Error("Pages must be an array");
          }
        } catch (e) {
          return res.status(400).json({ error: "Invalid pages format. Use 'all' or array like [1,2,3]" });
        }
      }

      const imagePaths = await PDFService.convertPDFToImages(file.path, {
        format: format as "png" | "jpeg",
        scale: parseInt(scale),
        quality: parseInt(quality),
        pages: pageArray
      });

      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      if (imagePaths.length === 1) {
        const imageExt = format === "jpeg" ? "jpg" : format;
        res.setHeader("Content-Type", `image/${imageExt}`);
        res.setHeader("Content-Disposition", `attachment; filename=converted.${imageExt}`);
        res.sendFile(imagePaths[0], () => {
          if (fs.existsSync(imagePaths[0])) {
            fs.unlinkSync(imagePaths[0]);
          }
        });
      } else {
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
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          });
        }, 1000);
      }
    } catch (error: any) {
      console.error("Convert to images error:", error);

      const file = (req as MulterRequest).file;
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      if (error.message.includes("poppler") || error.message.includes("PDFPage")) {
        res.status(500).json({
          error: "PDF to image conversion requires poppler-utils. Install with: brew install poppler (macOS) or sudo apt-get install poppler-utils (Linux)"
        });
      } else {
        res.status(500).json({ error: `Failed to convert PDF to images: ${error.message}` });
      }
    }
  }

  static async convertToText(req: Request, res: Response) {
    try {
      const file = (req as MulterRequest).file!;

      const text = await PDFService.convertPDFToText(file.path);

      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      if (req.headers.accept?.includes("text/plain")) {
        res.setHeader("Content-Type", "text/plain");
        res.setHeader("Content-Disposition", "attachment; filename=extracted.txt");
        res.send(text);
      } else {
        res.json({
          text: text,
          characterCount: text.length,
          wordCount: text.split(/\s+/).filter(word => word.length > 0).length,
          note: "Text extracted successfully"
        });
      }
    } catch (error: any) {
      console.error("Convert to text error:", error);

      const file = (req as MulterRequest).file;
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      res.status(500).json({ error: `Failed to extract text: ${error.message}` });
    }
  }

  static async splitByRanges(req: Request, res: Response) {
    try {
      const file = (req as MulterRequest).file!;
      const { ranges } = req.body;

      if (!ranges || typeof ranges !== "string") {
        return res.status(400).json({
          error: "Missing or invalid 'ranges' parameter. Format: '1-5,7,9-12'"
        });
      }

      const splitPDFs = await PDFService.splitPDFByRanges(file.path, ranges);

      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      if (splitPDFs.length === 1) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=split.pdf");
        res.send(splitPDFs[0]);
      } else {
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
    } catch (error: any) {
      console.error("Split by ranges error:", error);

      const file = (req as MulterRequest).file;
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      res.status(500).json({ error: `Failed to split PDF: ${error.message}` });
    }
  }

  static async imagesToPDF(req: Request, res: Response) {
    try {
      const files = (req as MulterRequest).files!;

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No image files provided" });
      }

      const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp"];
      for (const file of files) {
        const ext = file.originalname.toLowerCase().slice(-4);
        if (!validExtensions.some(e => ext.endsWith(e))) {
          files.forEach(f => {
            if (fs.existsSync(f.path)) {
              fs.unlinkSync(f.path);
            }
          });
          return res.status(400).json({
            error: `Invalid file type: ${file.originalname}. Supported: JPG, PNG, GIF, BMP`
          });
        }
      }

      const imagePaths = files.map(f => f.path);
      const pdfBuffer = await PDFService.imagesToPDF(imagePaths);

      imagePaths.forEach(imagePath => {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=images.pdf");
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error("Images to PDF error:", error);

      const files = (req as MulterRequest).files;
      if (files) {
        files.forEach(f => {
          if (fs.existsSync(f.path)) {
            fs.unlinkSync(f.path);
          }
        });
      }

      res.status(500).json({ error: `Failed to create PDF from images: ${error.message}` });
    }
  }
}
