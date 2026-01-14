import { z } from "zod";
export declare const uploadFileSchema: z.ZodObject<{
    file: z.ZodEffects<z.ZodEffects<z.ZodType<File, z.ZodTypeDef, File>, File, File>, File, File>;
}, "strip", z.ZodTypeAny, {
    file: File;
}, {
    file: File;
}>;
export declare const pdfToolSchema: z.ZodEnum<["extract-text", "convert-to-images", "merge", "split", "compress"]>;
export type UploadFile = z.infer<typeof uploadFileSchema>;
export type PDFTool = z.infer<typeof pdfToolSchema>;
//# sourceMappingURL=validation.d.ts.map