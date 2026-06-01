import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "30", 10), 100);
  const page = searchParams.get("page");

  try {
    const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;
    let query = db
      .from("cms_activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (page) query = query.eq("page_name", page);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
