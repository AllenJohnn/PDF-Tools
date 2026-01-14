import { Request, Response, NextFunction } from "express";
export declare const getErrorMessage: (error: any) => string;
export declare const handleAsyncError: (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => void;
export declare const errorResponse: (res: Response, statusCode: number, message: string, error?: any) => void;
export declare const successResponse: (res: Response, statusCode: number, message: string, data?: any) => void;
//# sourceMappingURL=response.d.ts.map