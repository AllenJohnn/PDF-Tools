import express from "express";
import cors from "cors";
import path from "path";
import pdfRoutes from "./routes/pdfRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/pdf", pdfRoutes);

// Basic routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "PDF Processor is running",
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📄 Open browser: http://localhost:${PORT}`);
  console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
  console.log(`📄 PDF API: http://localhost:${PORT}/api/pdf/health`);
});
