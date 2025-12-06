import { Router } from "express";
import { PDFController } from "../controllers/pdfController";
import { upload } from "../utils/fileHandler";

const router = Router();

// PDF Operations
router.post("/merge", upload.array("files", 10), PDFController.merge);
router.post("/split", upload.single("file"), PDFController.split);
router.post("/compress", upload.single("file"), PDFController.compress);
router.post("/info", upload.single("file"), PDFController.getInfo);

// Health check
router.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "PDF Processor API is running",
    timestamp: new Date().toISOString()
  });
});

export default router;
