export declare class PDFService {
    static mergePDFs(filePaths: string[]): Promise<Buffer>;
    static splitPDF(filePath: string, pagesPerSplit: number): Promise<Buffer[]>;
    static compressPDF(filePath: string): Promise<Buffer>;
    static getPDFInfo(filePath: string): Promise<any>;
    static imagesToPDF(imagePaths: string[]): Promise<Buffer>;
    static convertPDFToImages(filePath: string, options?: {
        format?: "png" | "jpeg";
        quality?: number;
        scale?: number;
        pages?: number[] | "all";
    }): Promise<string[]>;
    static convertPDFToText(filePath: string): Promise<string>;
    static splitPDFByRanges(filePath: string, ranges: string): Promise<Buffer[]>;
    private static parseRangeString;
    private static groupConsecutivePages;
}
//# sourceMappingURL=pdfService.d.ts.map