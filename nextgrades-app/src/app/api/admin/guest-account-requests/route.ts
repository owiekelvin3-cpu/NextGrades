import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json({ error: "Service role not configured." }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const admin = createAdminClient();
    let query = admin
      .from("guest_account_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ requests: data ?? [] });
  } catch (error: unknown) {
    console.error("Guest account requests list error:", error);
    const message = error instanceof Error ? error.message : "Failed to load requests";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
