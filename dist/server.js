"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const Sentry = __importStar(require("@sentry/node"));
const pdfRoutes_1 = __importDefault(require("./routes/pdfRoutes"));
const logger_1 = __importDefault(require("./utils/logger"));
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const swagger_1 = require("./config/swagger");
const sentry_1 = require("./utils/sentry");
const redis_1 = require("./utils/redis");
dotenv_1.default.config();
(0, sentry_1.initSentry)();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: process.env.CORS_ORIGIN || "http://localhost:5173" },
});
const PORT = process.env.PORT || 5000;
app.use(Sentry.Handlers.requestHandler());
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
app.use(rateLimiter_1.generalLimiter);
// Serve React client build
app.use(express_1.default.static(path_1.default.join(__dirname, "../client/dist")));
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
io.on("connection", (socket) => {
    logger_1.default.info(`User connected: ${socket.id}`);
    socket.on("disconnect", () => {
        logger_1.default.info(`User disconnected: ${socket.id}`);
    });
});
app.set("io", io);
const uploadsDir = path_1.default.join(__dirname, "..", "uploads");
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const convertedImagesDir = path_1.default.join(uploadsDir, "converted_images");
if (!fs_1.default.existsSync(convertedImagesDir)) {
    fs_1.default.mkdirSync(convertedImagesDir, { recursive: true });
}
app.use("/uploads", express_1.default.static(uploadsDir));
app.use("/api/pdf", rateLimiter_1.uploadLimiter, pdfRoutes_1.default);
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "PDF Processor is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development"
    });
});
// Serve React app for all non-API routes
app.get("*", (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path_1.default.join(__dirname, "../client/dist", "index.html"));
    }
});
app.use(Sentry.Handlers.errorHandler());
app.use(errorHandler_1.errorHandler);
httpServer.listen(PORT, async () => {
    try {
        await (0, redis_1.initRedis)();
    }
    catch (error) {
        logger_1.default.warn("Redis initialization failed - running without cache");
    }
    logger_1.default.info(`🚀 Server running at http://localhost:${PORT}`);
    logger_1.default.info(`📄 Frontend:    http://localhost:${PORT}`);
    logger_1.default.info(`🔧 API Health:  http://localhost:${PORT}/api/health`);
    logger_1.default.info(`📚 API Docs:    http://localhost:${PORT}/api-docs`);
    logger_1.default.info(`📁 Uploads dir: ${uploadsDir}`);
    logger_1.default.info(`📁 Converted images: ${convertedImagesDir}`);
});
//# sourceMappingURL=server.js.map