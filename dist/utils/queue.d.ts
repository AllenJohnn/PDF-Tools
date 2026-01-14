import Queue from "bull";
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
export declare const getPdfQueue: () => Queue.Queue<PDFProcessingJob> | null;
//# sourceMappingURL=queue.d.ts.map