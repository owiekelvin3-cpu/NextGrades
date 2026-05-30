import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminApi } from "@/lib/auth/api-auth";

export async function GET(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const search = (searchParams.get("search") || "").trim();
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";
    const verified = searchParams.get("verified") || "";
    const sort = searchParams.get("sort") || "created_at";

    let query = gate.auth!.supabase.from("profiles").select("*", { count: "exact" });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`);
    }

    if (role && role !== "all") {
      query = query.eq("role", role);
    }

    if (status === "active") {
      query = query.eq("is_active", true);
    } else if (status === "inactive") {
      query = query.eq("is_active", false);
    }

    if (verified === "verified") {
      query = query.eq("email_verified", true);
    } else if (verified === "unverified") {
      query = query.eq("email_verified", false);
    }

    const ascending = sort === "created_at_asc" || sort === "full_name" || sort === "email";
    const sortColumn =
      sort === "created_at_asc" ? "created_at" : sort.replace("_asc", "").replace("_desc", "") || "created_at";

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order(sortColumn, { ascending });

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      users: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching users:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
