import { z } from "zod";

export const uploadFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, "File is required")
    .refine(
      (file) => file.type === "application/pdf",
      "Only PDF files are allowed"
    ),
});

export const pdfToolSchema = z.enum([
  "extract-text",
  "convert-to-images",
  "merge",
  "split",
  "compress",
]);

export type UploadFile = z.infer<typeof uploadFileSchema>;
export type PDFTool = z.infer<typeof pdfToolSchema>;
