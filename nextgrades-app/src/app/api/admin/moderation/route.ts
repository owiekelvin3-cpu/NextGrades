import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/auth-utils";

// GET - Fetch all resources pending moderation
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const auth = await requireRole(supabase, "admin");
    
    if (!auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const { data, error } = await supabase
      .from("materials")
      .select(`
        *,
        profiles:profiles(id, full_name, avatar_url),
        category:resource_categories(id, name)
      `)
      .eq("moderation_status", status)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error fetching moderation queue:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch moderation queue" },
      { status: 500 }
    );
  }
}
