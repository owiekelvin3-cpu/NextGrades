import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile, requireRole } from "@/lib/quiz/auth";
import {
  ALLOWED_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  extractTextFromBuffer,
} from "@/lib/quiz/extract-text";

export const runtime = "nodejs";
export const maxDuration = 30;

const IMAGE_MIMES = new Set(["image/png", "image/jpeg", "image/webp"]);

function fileKind(mime: string): "document" | "image" {
  return IMAGE_MIMES.has(mime) ? "image" : "document";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { user, profile, error: authError } = await getAuthProfile(supabase);

  if (!user || !profile) {
    return NextResponse.json({ error: authError ?? "Unauthorized" }, { status: 401 });
  }

  if (!requireRole(profile, ["student", "teacher", "admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File too large (max 15 MB)" }, { status: 400 });
  }

  const mime = file.type || "application/octet-stream";
  const kind = fileKind(mime);
  const buffer = Buffer.from(await file.arrayBuffer());

  let content = "";
  if (kind === "image") {
    content = "";
  } else {
    const ext = ALLOWED_MIME_TYPES[mime];
    const name = file.name.toLowerCase();
    const fileType =
      ext ??
      (name.endsWith(".md") || name.endsWith(".csv") ? "txt" : name.endsWith(".pdf") ? "pdf" : name.endsWith(".docx") ? "docx" : "txt");

    if (!ext && !name.match(/\.(pdf|docx|txt|md|csv)$/)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use PDF, Word, TXT, MD, or CSV." },
        { status: 400 }
      );
    }

    try {
      content = await extractTextFromBuffer(buffer, fileType, file.name);
    } catch {
      return NextResponse.json({ error: "Could not read file content" }, { status: 422 });
    }

    if (!content.trim()) {
      return NextResponse.json({ error: "No readable text found in this file" }, { status: 422 });
    }
  }

  return NextResponse.json({
    attachment: {
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: file.name,
      mimeType: mime,
      size: file.size,
      content,
      kind,
    },
  });
}
