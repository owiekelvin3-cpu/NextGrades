export type ChatAttachment = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  /** Extracted text for documents; optional note for images */
  content: string;
  /** Client-only blob URL for image preview */
  previewUrl?: string;
  kind: "document" | "image";
};

export const CHAT_ACCEPTED_FILE_TYPES =
  ".pdf,.docx,.txt,.md,.csv,.png,.jpg,.jpeg,.webp";

export const CHAT_ACCEPTED_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/webp",
].join(",");

export const MAX_CHAT_ATTACHMENTS = 5;

export function buildUserMessageWithAttachments(
  message: string,
  attachments: ChatAttachment[]
): string {
  const trimmed = message.trim();
  if (!attachments.length) return trimmed;

  const blocks = attachments.map((file) => {
    if (file.kind === "image") {
      return `--- Attached image: ${file.name} ---\nThe user attached an image. Refer to their message for what they need help with regarding this image.\n--- End attachment ---`;
    }
    const excerpt = file.content.trim() || `[No extractable text in ${file.name}]`;
    return `--- Attached file: ${file.name} ---\n${excerpt}\n--- End attachment ---`;
  });

  const body = trimmed || "(See attached file(s))";
  return `${body}\n\n${blocks.join("\n\n")}`;
}

export function attachmentSummary(attachments: ChatAttachment[], lang: "de" | "en"): string {
  if (!attachments.length) return "";
  const n = attachments.length;
  return lang === "de"
    ? `${n} Datei${n > 1 ? "en" : ""} angehängt`
    : `${n} file${n > 1 ? "s" : ""} attached`;
}
