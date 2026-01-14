import { Request, Response } from "express";
export declare class PDFController {
    static merge(req: Request, res: Response): Promise<void>;
    static split(req: Request, res: Response): Promise<void>;
    static compress(req: Request, res: Response): Promise<void>;
    static getInfo(req: Request, res: Response): Promise<void>;
    static convertToImages(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static convertToText(req: Request, res: Response): Promise<void>;
    static splitByRanges(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static imagesToPDF(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=pdfController.d.ts.map