import express from "express";
export declare class AppError extends Error {
    statusCode: number;
    message: string;
    constructor(statusCode: number, message: string);
}
export declare const errorHandler: (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => express.Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=errorHandler.d.ts.map