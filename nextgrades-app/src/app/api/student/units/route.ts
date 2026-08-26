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

  const total = data?.total_units ?? 0;
  const remaining = data?.remaining_units ?? 0;
  const hasPackage = total > 0 || remaining > 0;

  if (!hasPackage) {
    return NextResponse.json({
      hasPackage: false,
      purchased: 0,
      completed: 0,
      remaining: 0,
      total: 0,
    });
  }

  return NextResponse.json({
    hasPackage: true,
    purchased: total,
    completed: Math.max(0, total - remaining),
    remaining,
    total,
  });
}
