import { NextResponse } from "next/server";
import { requireAuthenticatedApi } from "@/lib/auth/api-auth";

export async function GET(request: Request) {
  const gate = await requireAuthenticatedApi();
  if (gate.error) return gate.error;

  const supabase = gate.auth!.supabase;
  const user = gate.auth!.user;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const category = searchParams.get("category");
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  let query = supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) query = query.eq("category", category);
  if (unreadOnly) query = query.eq("is_read", false);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    notifications: data ?? [],
    total: count ?? 0,
    hasMore: (count ?? 0) > offset + limit,
  });
}
