import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import * as Sentry from "@sentry/node";
import pdfRoutes from "./routes/pdfRoutes";
import logger from "./utils/logger";
import { errorHandler } from "./middleware/errorHandler";
import { generalLimiter, uploadLimiter } from "./middleware/rateLimiter";
import { swaggerSpec } from "./config/swagger";
import { initSentry } from "./utils/sentry";
import { initRedis } from "./utils/redis";

dotenv.config();

initSentry();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN || "http://localhost:5173" },
});
const PORT = process.env.PORT || 5000;

app.use(Sentry.Handlers.requestHandler());
app.use(helmet());
app.use(compression());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(generalLimiter);

// Serve React client build
app.use(express.static(path.join(__dirname, "../client/dist")));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

io.on("connection", (socket) => {
  logger.info(`User connected: ${socket.id}`);
  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

app.set("io", io);

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const convertedImagesDir = path.join(uploadsDir, "converted_images");
if (!fs.existsSync(convertedImagesDir)) {
    fs.mkdirSync(convertedImagesDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));

app.use("/api/pdf", uploadLimiter, pdfRoutes);

app.get("/api/health", (req: express.Request, res: express.Response) => {
    res.json({ 
        status: "OK", 
        message: "PDF Processor is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development"
    });
});

// Serve React app for all non-API routes
app.get("*", (req: express.Request, res: express.Response) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
    }
});

app.use(Sentry.Handlers.errorHandler());
app.use(errorHandler);

httpServer.listen(PORT, async () => {
  try {
    await initRedis();
  } catch (error) {
    logger.warn("Redis initialization failed - running without cache");
  }
  
  logger.info(`🚀 Server running at http://localhost:${PORT}`);
  logger.info(`📄 Frontend:    http://localhost:${PORT}`);
  logger.info(`🔧 API Health:  http://localhost:${PORT}/api/health`);
  logger.info(`📚 API Docs:    http://localhost:${PORT}/api-docs`);
  logger.info(`📁 Uploads dir: ${uploadsDir}`);
  logger.info(`📁 Converted images: ${convertedImagesDir}`);
});