import { Request, Response } from "express";
import { PDFService } from "../services/pdfService";
import fs from "fs";

// Define types for multer files
interface MulterRequest extends Request {
  files?: Express.Multer.File[];
  file?: Express.Multer.File;
}

export class PDFController {
  
  static async merge(req: Request, res: Response) {
    try {
      const files = (req as MulterRequest).files!;
      const filePaths = files.map(file => file.path);
      
      const mergedPDF = await PDFService.mergePDFs(filePaths);
      
      // Clean up temp files
      filePaths.forEach(filePath => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=merged.pdf");
      res.send(mergedPDF);
      
    } catch (error: any) {
      console.error("Merge error:", error);
      res.status(500).json({ error: "Failed to merge PDFs" });
    }
  }

  static async split(req: Request, res: Response) {
    try {
      const file = (req as MulterRequest).file!;
      const { pagesPerSplit = 1 } = req.body;
      
      const splitPDFs = await PDFService.splitPDF(file.path, parseInt(pagesPerSplit));
      
      // Clean up temp file
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      
      if (splitPDFs.length === 1) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=split.pdf");
        res.send(splitPDFs[0]);
      } else {
        // Send as zip in production
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
      
      // Clean up temp file
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      
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
      
      // Clean up temp file
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      
      res.json({
        ...info,
        message: "Basic PDF info extracted. Install pdf-parse for detailed text extraction."
      });
      
    } catch (error: any) {
      console.error("Info error:", error);
      res.status(500).json({ error: "Failed to get PDF info" });
    }
  }

  // Add these methods to your existing PDFController class

static async convertToImages(req: Request, res: Response) {
  try {
    const file = (req as MulterRequest).file!;
    const { 
      format = "png", 
      scale = "2",
      pages = "all",
      quality = "100"
    } = req.body;
    
    // Validate format
    if (!["png", "jpeg", "jpg"].includes(format)) {
      return res.status(400).json({ error: "Format must be png, jpeg, or jpg" });
    }
    
    // Parse pages parameter
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
    
    // Convert PDF to images
    const imagePaths = await PDFService.convertPDFToImages(file.path, {
      format: format as "png" | "jpeg",
      scale: parseInt(scale),
      quality: parseInt(quality),
      pages: pageArray
    });
    
    // Clean up temp PDF file
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    
    if (imagePaths.length === 1) {
      // Send single image
      const imageExt = format === "jpeg" ? "jpg" : format;
      res.setHeader("Content-Type", `image/${imageExt}`);
      res.setHeader("Content-Disposition", `attachment; filename=converted.${imageExt}`);
      res.sendFile(imagePaths[0], () => {
        // Clean up the image file after sending
        if (fs.existsSync(imagePaths[0])) fs.unlinkSync(imagePaths[0]);
      });
    } else {
      // Multiple images - create zip or send info
      res.json({
        message: `PDF converted to ${imagePaths.length} images`,
        images: imagePaths.map((path, index) => ({
          filename: `page-${index + 1}.${format === "jpeg" ? "jpg" : format}`,
          path: path.replace(/^.*[\\\/]/, '') // Just filename
        })),
        note: "In production, consider zipping multiple images for download"
      });
      
      // Clean up image files after response
      setTimeout(() => {
        imagePaths.forEach(imagePath => {
          if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        });
      }, 1000);
    }
    
  } catch (error: any) {
    console.error("Convert to images error:", error);
    
    // Clean up temp file if it exists
    const file = (req as MulterRequest).file;
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    // Check for poppler dependency error
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
    
    // Convert PDF to text using the service
    const text = await PDFService.convertPDFToText(file.path);
    
    // Clean up temp file
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    
    // Send as text file or JSON response
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
    
    // Clean up temp file if it exists
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
    
    // Use the enhanced split method
    const splitPDFs = await PDFService.splitPDFByRanges(file.path, ranges);
    
    // Clean up temp file
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    
    if (splitPDFs.length === 1) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=split.pdf");
      res.send(splitPDFs[0]);
    } else {
      // For multiple files, return info (or create zip in production)
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
    
    // Clean up temp file if it exists
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

    // Validate that all files are images
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    for (const file of files) {
      const ext = file.originalname.toLowerCase().slice(-4);
      if (!validExtensions.some(e => ext.endsWith(e))) {
        // Clean up temp files
        files.forEach(f => {
          if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
        });
        return res.status(400).json({ 
          error: `Invalid file type: ${file.originalname}. Supported: JPG, PNG, GIF, BMP` 
        });
      }
    }

    const imagePaths = files.map(f => f.path);
    const pdfBuffer = await PDFService.imagesToPDF(imagePaths);

    // Clean up temp image files
    imagePaths.forEach(imagePath => {
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=images.pdf");
    res.send(pdfBuffer);

  } catch (error: any) {
    console.error("Images to PDF error:", error);

    // Clean up temp files if they exist
    const files = (req as MulterRequest).files;
    if (files) {
      files.forEach(f => {
        if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
      });
    }

    res.status(500).json({ error: `Failed to create PDF from images: ${error.message}` });
  }
}
}


