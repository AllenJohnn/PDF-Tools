import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import logger from "../utils/logger";

export const getErrorMessage = (error: any): string => {
  if (error instanceof ZodError) {
    const issue = error.issues[0];
    return `Validation error: ${issue.message} (${issue.path.join(".")})`;
  }

  if (error.message) {
    return error.message;
  }

  return "An unexpected error occurred";
};

export const handleAsyncError = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const errorResponse = (res: Response, statusCode: number, message: string, error?: any) => {
  res.status(statusCode).json({
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && error && { details: error }),
  });
};

export const successResponse = (res: Response, statusCode: number, message: string, data?: any) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};
