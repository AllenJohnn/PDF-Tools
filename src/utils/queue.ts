import Queue, { Job } from "bull";
import logger from "./logger";

export interface PDFProcessingJob {
  type: string;
  filePath: string;
  options: any;
  userId?: string;
}

export interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
  processingTime: number;
}

// Only create queue if Redis is enabled
let pdfQueue: Queue.Queue<PDFProcessingJob> | null = null;

if (process.env.REDIS_ENABLED !== "false") {
  const redisOptions = {
    redis: {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT || "6379"),
    },
  };

  pdfQueue = new Queue<PDFProcessingJob>("pdf-processing", redisOptions);
} else {
  logger.info("Bull queue disabled - Redis is disabled");
}

export const getPdfQueue = (): Queue.Queue<PDFProcessingJob> | null => pdfQueue;

if (pdfQueue) {
  pdfQueue.process(async (job: Job<PDFProcessingJob>) => {
    const startTime = Date.now();
    logger.info(`Processing job ${job.id}: ${job.data.type}`);

    try {
      job.progress(10);
      const result: JobResult = {
        success: true,
        processingTime: 0,
      };

      job.progress(100);
      result.processingTime = Date.now() - startTime;

      logger.info(`Job ${job.id} completed in ${result.processingTime}ms`);
      return result;
    } catch (error: any) {
      logger.error(`Job ${job.id} failed: ${error.message}`);
      throw error;
    }
  });

  pdfQueue.on("failed", (job, error) => {
    logger.error(`Queue job ${job.id} failed: ${error.message}`);
  });

  pdfQueue.on("completed", (job) => {
    logger.info(`Queue job ${job.id} completed successfully`);
  });
}
