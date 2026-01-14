"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPdfQueue = void 0;
const bull_1 = __importDefault(require("bull"));
const logger_1 = __importDefault(require("./logger"));
// Only create queue if Redis is enabled
let pdfQueue = null;
if (process.env.REDIS_ENABLED !== "false") {
    const redisOptions = {
        redis: {
            host: process.env.REDIS_HOST || "127.0.0.1",
            port: parseInt(process.env.REDIS_PORT || "6379"),
        },
    };
    pdfQueue = new bull_1.default("pdf-processing", redisOptions);
}
else {
    logger_1.default.info("Bull queue disabled - Redis is disabled");
}
const getPdfQueue = () => pdfQueue;
exports.getPdfQueue = getPdfQueue;
if (pdfQueue) {
    pdfQueue.process(async (job) => {
        const startTime = Date.now();
        logger_1.default.info(`Processing job ${job.id}: ${job.data.type}`);
        try {
            job.progress(10);
            const result = {
                success: true,
                processingTime: 0,
            };
            job.progress(100);
            result.processingTime = Date.now() - startTime;
            logger_1.default.info(`Job ${job.id} completed in ${result.processingTime}ms`);
            return result;
        }
        catch (error) {
            logger_1.default.error(`Job ${job.id} failed: ${error.message}`);
            throw error;
        }
    });
    pdfQueue.on("failed", (job, error) => {
        logger_1.default.error(`Queue job ${job.id} failed: ${error.message}`);
    });
    pdfQueue.on("completed", (job) => {
        logger_1.default.info(`Queue job ${job.id} completed successfully`);
    });
}
//# sourceMappingURL=queue.js.map