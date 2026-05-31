import { searchRelevantChunks, buildMaterialContext } from "./rag";
import type { ChatContext, ChatRole } from "./types";

type DbClient = {
  from: (table: string) => unknown;
};

type MaterialRow = {
  id: string;
  title: string;
  extracted_text: string | null;
  extraction_status: string;
  uploaded_by: string;
  topic: string | null;
  semester: string | null;
  subject_id: string | null;
  class_id: string | null;
};

export async function loadChatContext(
  supabase: DbClient,
  userId: string,
  role: ChatRole,
  userName: string | null,
  opts: {
    materialId?: string;
    subjectId?: string;
    classId?: string;
    semester?: string;
    topic?: string;
    userMessage?: string;
    ragEnabled?: boolean;
  }
): Promise<ChatContext> {
  const ctx: ChatContext = {
    role,
    userName,
    semester: opts.semester,
    topic: opts.topic,
  };

  if (opts.subjectId) {
    const { data } = await (supabase.from("subjects") as {
      select: (c: string) => { eq: (col: string, val: string) => { maybeSingle: () => Promise<{ data: { name?: string } | null }> } };
    })
      .select("name")
      .eq("id", opts.subjectId)
      .maybeSingle();
    if (data?.name) ctx.subject = data.name;
  }

  if (opts.classId) {
    const { data } = await (supabase.from("classes") as {
      select: (c: string) => { eq: (col: string, val: string) => { maybeSingle: () => Promise<{ data: { name?: string; grade_level?: string } | null }> } };
    })
      .select("name, grade_level")
      .eq("id", opts.classId)
      .maybeSingle();
    if (data) {
      ctx.classLevel = [data.name, data.grade_level].filter(Boolean).join(" · ") || undefined;
    }
  }

  if (!opts.materialId || !opts.ragEnabled) return ctx;

  const { data: material } = await (supabase.from("uploaded_materials") as {
    select: (c: string) => { eq: (col: string, val: string) => { maybeSingle: () => Promise<{ data: MaterialRow | null }> } };
  })
    .select("id, title, extracted_text, extraction_status, uploaded_by, topic, semester, subject_id, class_id")
    .eq("id", opts.materialId)
    .maybeSingle();

  if (!material) return ctx;

  const mat = material as MaterialRow;

  if (role === "teacher" && mat.uploaded_by !== userId) {
    return ctx;
  }

  if (role === "student") {
    const { data: published } = await (supabase.from("generated_quizzes") as {
      select: (c: string) => {
        eq: (col: string, val: string) => {
          eq: (col2: string, val2: boolean) => {
            limit: (n: number) => { maybeSingle: () => Promise<{ data: { id?: string } | null }> };
          };
        };
      };
    })
      .select("id")
      .eq("material_id", mat.id)
      .eq("is_published", true)
      .limit(1)
      .maybeSingle();
    if (!published) return ctx;
  }

  ctx.materialTitle = mat.title;
  if (mat.topic) ctx.topic = mat.topic;
  if (mat.semester) ctx.semester = mat.semester;

  if (mat.extraction_status === "ready" && mat.extracted_text && opts.userMessage) {
    const excerpts = searchRelevantChunks(mat.extracted_text, opts.userMessage);
    ctx.materialExcerpt = buildMaterialContext(excerpts, mat.title);
  }

  return ctx;
}

export function titleFromMessage(message: string): string {
  const cleaned = message.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 48) return cleaned || "New chat";
  return `${cleaned.slice(0, 45)}…`;
}
