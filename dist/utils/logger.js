"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};
const colors = {
    error: "red",
    warn: "yellow",
    info: "green",
    debug: "blue",
};
winston_1.default.addColors(colors);
const format = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}` +
    (info.stack ? `\n${info.stack}` : "")));
const transports = [
    new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize({ all: true }), format),
    }),
    new winston_1.default.transports.File({
        filename: "logs/error.log",
        level: "error",
        format,
    }),
    new winston_1.default.transports.File({
        filename: "logs/all.log",
        format,
    }),
];
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || "info",
    levels,
    format,
    transports,
});
exports.default = logger;
//# sourceMappingURL=logger.js.map