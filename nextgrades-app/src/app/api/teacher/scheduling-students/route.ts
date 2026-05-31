import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { listEligibleStudentsForTeacher } from "@/lib/zoom/scheduling";

/** Enrolled / assigned students available when scheduling Zoom classes. */
export async function GET() {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  const teacherId = gate.auth!.profile!.id;
  const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;
  const students = await listEligibleStudentsForTeacher(db, teacherId);

  return NextResponse.json({ students });
}
