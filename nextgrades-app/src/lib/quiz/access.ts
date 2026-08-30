import type { SupabaseClient } from "@supabase/supabase-js";

export function isQuizGrantActive(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() > Date.now();
}

export async function listGrantedQuizIds(
  db: SupabaseClient,
  studentId: string
): Promise<string[]> {
  const { data, error } = await db
    .from("quiz_grants")
    .select("quiz_id, expires_at")
    .eq("student_id", studentId)
    .eq("status", "active");

  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((row) => isQuizGrantActive(row.expires_at as string | null))
    .map((row) => row.quiz_id as string)
    .filter(Boolean);
}

export async function studentCanAccessQuiz(
  db: SupabaseClient,
  studentId: string,
  quizId: string
): Promise<boolean> {
  const { data, error } = await db
    .from("quiz_grants")
    .select("id, expires_at")
    .eq("student_id", studentId)
    .eq("quiz_id", quizId)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return false;
  return isQuizGrantActive(data.expires_at as string | null);
}
