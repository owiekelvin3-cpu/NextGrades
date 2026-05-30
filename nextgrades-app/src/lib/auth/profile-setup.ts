import type { SupabaseClient } from "@supabase/supabase-js";

type SetupRole = "student" | "teacher";

function randomMemberSuffix(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function generateStudentMemberId(): string {
  return `STU-${new Date().getFullYear()}-${randomMemberSuffix()}`;
}

export function generateTeacherMemberId(): string {
  return `TCH-${new Date().getFullYear()}-${randomMemberSuffix()}`;
}

/** Ensure profile role, display member ID, and role-specific rows exist after signup. */
export async function ensureRoleProfile(
  admin: SupabaseClient,
  userId: string,
  role: SetupRole,
  fields: { fullName: string; email: string; verified: boolean }
) {
  const now = new Date().toISOString();

  const { data: existing } = await admin
    .from("profiles")
    .select("student_id, teacher_id, role")
    .eq("id", userId)
    .maybeSingle();

  const profilePatch: Record<string, unknown> = {
    id: userId,
    full_name: fields.fullName,
    email: fields.email,
    role,
    email_verified: fields.verified,
    email_verified_at: fields.verified ? now : null,
    updated_at: now,
  };

  if (role === "student" && !existing?.student_id) {
    profilePatch.student_id = generateStudentMemberId();
    profilePatch.teacher_id = null;
  }

  if (role === "teacher" && !existing?.teacher_id) {
    profilePatch.teacher_id = generateTeacherMemberId();
    profilePatch.student_id = null;
  }

  await admin.from("profiles").upsert(profilePatch);

  if (role === "student") {
    await admin.from("user_units").upsert(
      {
        student_id: userId,
        total_units: 0,
        remaining_units: 0,
        updated_at: now,
      },
      { onConflict: "student_id" }
    );
  }

  if (role === "teacher") {
    await admin.from("teacher_stats").upsert(
      {
        teacher_id: userId,
        total_hours: 0,
        current_bonus_level: 1,
        earnings_mtd: 0,
        updated_at: now,
      },
      { onConflict: "teacher_id" }
    );
  }
}
