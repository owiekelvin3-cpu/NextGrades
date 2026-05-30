import mammoth from "mammoth";

const MAX_TEXT_LENGTH = 120_000;

export function truncateText(text: string): string {
  const cleaned = text.replace(/\0/g, "").trim();
  if (cleaned.length <= MAX_TEXT_LENGTH) return cleaned;
  return `${cleaned.slice(0, MAX_TEXT_LENGTH)}\n\n[Content truncated for processing…]`;
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  fileType: "pdf" | "docx" | "txt" | "paste" | "other",
  fileName?: string
): Promise<string> {
  if (fileType === "paste" || fileType === "txt") {
    return truncateText(buffer.toString("utf-8"));
  }

  if (fileType === "docx" || fileName?.toLowerCase().endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return truncateText(result.value);
  }

  if (fileType === "pdf" || fileName?.toLowerCase().endsWith(".pdf")) {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return truncateText(result.text || "");
  }

  return truncateText(buffer.toString("utf-8"));
}

export const ALLOWED_MIME_TYPES: Record<string, "pdf" | "docx" | "txt"> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "text/plain": "txt",
};

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
