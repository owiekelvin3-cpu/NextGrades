import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/auth-utils";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const auth = await requireRole(supabase, "admin");

    if (!auth.user) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";
    const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : supabase;

    const { data, error } = await db
      .from("materials")
      .select(`
        id,
        title,
        description,
        short_description,
        type,
        content_type,
        url,
        storage_path,
        thumbnail_url,
        status,
        moderation_status,
        moderation_notes,
        access_type,
        is_premium,
        price,
        created_at,
        created_by,
        subject_id,
        class_id,
        semester,
        author:profiles!materials_created_by_fkey(id, full_name, avatar_url),
        category:resource_categories(id, name),
        subject:subjects(id, name),
        class:classes(id, name, level)
      `)
      .eq("moderation_status", status)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (error: unknown) {
    console.error("Error fetching moderation queue:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch moderation queue" },
      { status: 500 }
    );
  }
}
