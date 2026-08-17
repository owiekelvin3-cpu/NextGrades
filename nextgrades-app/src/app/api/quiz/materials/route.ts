import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile, requireRole } from "@/lib/quiz/auth";
import { quizDataClient } from "@/lib/quiz/db";
import {
  ALLOWED_MIME_TYPES,
  extractTextFromBuffer,
  MAX_UPLOAD_BYTES,
} from "@/lib/quiz/extract-text";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();
    const { profile, error } = await getAuthProfile(supabase);
    if (!profile) return NextResponse.json({ error }, { status: 401 });
    if (!requireRole(profile, ["teacher", "admin"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const db = quizDataClient(supabase);

    let query = db
      .from("uploaded_materials")
      .select("*")
      .order("created_at", { ascending: false });

    if (profile.role === "teacher") {
      query = query.eq("uploaded_by", profile.id);
    }

    const { data, error: dbError } = await query;
    if (dbError) throw dbError;

    return NextResponse.json(data || []);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load materials";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { user, profile, error } = await getAuthProfile(supabase);
    if (!user || !profile) return NextResponse.json({ error }, { status: 401 });
    if (!requireRole(profile, ["teacher", "admin"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const db = quizDataClient(supabase);

    const formData = await request.formData();
    const title = String(formData.get("title") || "").trim();
    const pastedText = String(formData.get("pastedText") || "").trim();
    const file = formData.get("file") as File | null;
    const subjectId = formData.get("subjectId") ? String(formData.get("subjectId")) : null;
    const classId = formData.get("classId") ? String(formData.get("classId")) : null;
    const semester = formData.get("semester") ? Number(formData.get("semester")) : null;
    const topic = formData.get("topic") ? String(formData.get("topic")) : null;
    const chapter = formData.get("chapter") ? String(formData.get("chapter")) : null;
    const difficulty = String(formData.get("difficulty") || "medium");

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    let fileType: "pdf" | "docx" | "txt" | "paste" = "paste";
    let storagePath: string | null = null;
    let fileName: string | null = null;
    let fileSize: number | null = null;
    let extractedText = pastedText;
    let buffer: Buffer | null = null;

    if (file && file.size > 0) {
      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json({ error: "File exceeds 15MB limit" }, { status: 400 });
      }
      const mime = file.type || "";
      const mapped = ALLOWED_MIME_TYPES[mime];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (mapped) fileType = mapped;
      else if (ext === "pdf") fileType = "pdf";
      else if (ext === "docx") fileType = "docx";
      else if (ext === "txt") fileType = "txt";
      else {
        return NextResponse.json({ error: "Unsupported file type. Use PDF, DOCX, or TXT." }, { status: 400 });
      }

      fileName = file.name;
      fileSize = file.size;
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      storagePath = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

      const { error: uploadError } = await db.storage
        .from("learning-materials")
        .upload(storagePath, buffer, { contentType: mime || "application/octet-stream", upsert: false });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }
    }

    if (!buffer && !pastedText) {
      return NextResponse.json({ error: "Upload a file or paste lesson content" }, { status: 400 });
    }

    const { data: row, error: insertError } = await db
      .from("uploaded_materials")
      .insert({
        uploaded_by: user.id,
        title,
        file_name: fileName,
        file_type: fileType,
        storage_path: storagePath,
        file_size: fileSize,
        subject_id: subjectId,
        class_id: classId,
        semester,
        topic,
        chapter,
        difficulty_default: difficulty,
        extraction_status: "processing",
        extracted_text: null,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    try {
      if (buffer) {
        extractedText = await extractTextFromBuffer(buffer, fileType, fileName || undefined);
      }
      if (!extractedText?.trim()) {
        throw new Error("No readable text could be extracted");
      }

      const { data: updated, error: updateError } = await db
        .from("uploaded_materials")
        .update({
          extracted_text: extractedText,
          extraction_status: "ready",
          extraction_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return NextResponse.json(updated);
    } catch (extractErr) {
      const msg = extractErr instanceof Error ? extractErr.message : "Extraction failed";
      await db
        .from("uploaded_materials")
        .update({ extraction_status: "failed", extraction_error: msg })
        .eq("id", row.id);
      return NextResponse.json({ error: msg }, { status: 422 });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
