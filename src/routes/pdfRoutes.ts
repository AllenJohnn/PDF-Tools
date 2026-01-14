import { Router } from "express";
import { PDFController } from "../controllers/pdfController";
import { upload } from "../utils/fileHandler";

const router = Router();

router.post("/merge", upload.array("files", 10), PDFController.merge);
router.post("/split", upload.single("file"), PDFController.split);
router.post("/compress", upload.single("file"), PDFController.compress);
router.post("/info", upload.single("file"), PDFController.getInfo);

router.post("/convert-to-images", upload.single("file"), PDFController.convertToImages);
router.post("/convert-to-text", upload.single("file"), PDFController.convertToText);
router.post("/split-by-ranges", upload.single("file"), PDFController.splitByRanges);

router.post("/images-to-pdf", upload.array("files", 50), PDFController.imagesToPDF);

router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "PDF API is operational",
    timestamp: new Date().toISOString(),
    endpoints: {
      merge: "POST /api/pdf/merge",
      split: "POST /api/pdf/split",
      compress: "POST /api/pdf/compress",
      info: "POST /api/pdf/info",
      convertToImages: "POST /api/pdf/convert-to-images",
      convertToText: "POST /api/pdf/convert-to-text",
      splitByRanges: "POST /api/pdf/split-by-ranges",
      imagesToPDF: "POST /api/pdf/images-to-pdf",
      health: "GET /api/pdf/health"
    }
  });
});

export default router;
