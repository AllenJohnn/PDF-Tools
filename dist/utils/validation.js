"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfToolSchema = exports.uploadFileSchema = void 0;
const zod_1 = require("zod");
exports.uploadFileSchema = zod_1.z.object({
    file: zod_1.z
        .instanceof(File)
        .refine((file) => file.size > 0, "File is required")
        .refine((file) => file.type === "application/pdf", "Only PDF files are allowed"),
});
exports.pdfToolSchema = zod_1.z.enum([
    "extract-text",
    "convert-to-images",
    "merge",
    "split",
    "compress",
]);
//# sourceMappingURL=validation.js.map