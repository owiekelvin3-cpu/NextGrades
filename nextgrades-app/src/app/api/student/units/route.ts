import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuthenticatedApi } from "@/lib/auth/api-auth";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { settleHeldLessonUnits } from "@/lib/lessons/consume-units";

/** Returns the student's lesson package after settling held meetings. */
export async function GET() {
  const gate = await requireAuthenticatedApi();
  if (gate.error) return gate.error;

  const userId = gate.auth!.user.id;
  const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;
  await settleHeldLessonUnits(db);

  const { data } = await db
    .from("user_units")
    .select("total_units, remaining_units")
    .eq("student_id", userId)
    .maybeSingle();

  return NextResponse.json({
    total: data?.total_units ?? 0,
    remaining: data?.remaining_units ?? 0,
  });
}
