import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";

/** Demo/test notification title patterns to remove before launch. */
const DEMO_TITLE_PATTERNS = [
  "Willkommen bei NextGrades,",
  "Welcome to NextGrades,",
  "Test notification",
  "Demo notification",
  "Admin test",
];

/**
 * Remove old test/demo notifications that were broadcast with wrong targeting.
 * Matches titles containing demo patterns or exact legacy welcome strings.
 */
export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json({ error: "Service role not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    beforeDate?: string;
    dryRun?: boolean;
  };

  const admin = createAdminClient();
  const { data: all, error } = await admin
    .from("notifications")
    .select("id, title, user_id, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const beforeMs = body.beforeDate ? new Date(body.beforeDate).getTime() : null;
  const toDelete = (all ?? []).filter((n) => {
    const title = (n.title as string) ?? "";
    const matchesDemo = DEMO_TITLE_PATTERNS.some((p) => title.includes(p));
    const matchesDate = beforeMs != null && new Date(n.created_at as string).getTime() < beforeMs;
    return matchesDemo || matchesDate;
  });

  if (body.dryRun) {
    return NextResponse.json({ wouldDelete: toDelete.length, sample: toDelete.slice(0, 10) });
  }

  const ids = toDelete.map((n) => n.id as string);
  if (!ids.length) {
    return NextResponse.json({ deleted: 0 });
  }

  const { error: deleteError } = await admin.from("notifications").delete().in("id", ids);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  return NextResponse.json({ deleted: ids.length });
}
