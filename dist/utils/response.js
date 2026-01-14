"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = exports.errorResponse = exports.handleAsyncError = exports.getErrorMessage = void 0;
const zod_1 = require("zod");
const getErrorMessage = (error) => {
    if (error instanceof zod_1.ZodError) {
        const issue = error.issues[0];
        return `Validation error: ${issue.message} (${issue.path.join(".")})`;
    }
    if (error.message) {
        return error.message;
    }
    return "An unexpected error occurred";
};
exports.getErrorMessage = getErrorMessage;
const handleAsyncError = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.handleAsyncError = handleAsyncError;
const errorResponse = (res, statusCode, message, error) => {
    res.status(statusCode).json({
        error: message,
        statusCode,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === "development" && error && { details: error }),
    });
};
exports.errorResponse = errorResponse;
const successResponse = (res, statusCode, message, data) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
    });
};
exports.successResponse = successResponse;
//# sourceMappingURL=response.js.map