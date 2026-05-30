import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerReadClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const db = await createServerReadClient(supabase);
    const { searchParams } = new URL(request.url);

    const search = (searchParams.get("search") || "").trim();
    const access = searchParams.get("access");
    const categoryId = searchParams.get("category");
    const contentType = searchParams.get("contentType");
    const difficulty = searchParams.get("difficulty");
    const ageRange = searchParams.get("ageRange");
    const teacherId = searchParams.get("teacher");
    const language = searchParams.get("language");
    const sort = searchParams.get("sort") || "recent";
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const select = `
      id,
      title,
      description,
      short_description,
      full_description,
      type,
      content_type,
      url,
      thumbnail_url,
      file_size,
      is_premium,
      access_type,
      download_count,
      view_count,
      difficulty_level,
      age_range,
      estimated_minutes,
      language,
      created_at,
      created_by,
      category:resource_categories(id, name, icon),
      author:profiles!materials_created_by_fkey(id, full_name, avatar_url),
      resource_tag_relations(tag_id, resource_tags(id, name, slug, color))
    `;

    let query = db
      .from("materials")
      .select(select)
      .eq("status", "published")
      .eq("moderation_status", "approved")
      .limit(limit);

    if (categoryId) query = query.eq("category_id", categoryId);
    if (contentType) query = query.eq("content_type", contentType);
    if (difficulty) query = query.eq("difficulty_level", difficulty);
    if (ageRange) query = query.eq("age_range", ageRange);
    if (teacherId) query = query.eq("created_by", teacherId);
    if (language) query = query.eq("language", language);

    if (access === "free") {
      query = query.or("access_type.eq.free,is_premium.eq.false,is_premium.is.null");
    } else if (access === "premium") {
      query = query.or("access_type.eq.premium,is_premium.eq.true");
    }

    if (sort === "popular") {
      query = query.order("view_count", { ascending: false, nullsFirst: false });
    } else if (sort === "downloads") {
      query = query.order("download_count", { ascending: false, nullsFirst: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    let { data, error } = await query;

    if (error?.message?.includes("content_type") || error?.message?.includes("short_description")) {
      const fallback = await db
        .from("materials")
        .select(`
          id, title, description, type, url, thumbnail_url, file_size,
          is_premium, access_type, download_count, view_count, created_at, created_by,
          category:resource_categories(id, name, icon)
        `)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(limit);
      data = fallback.data as typeof data;
      error = fallback.error;
    }

    if (error) throw error;

    let results = data || [];

    if (search) {
      const q = search.toLowerCase();
      results = results.filter((item) => {
        const row = item as {
          title?: string;
          description?: string;
          short_description?: string;
          full_description?: string;
        };
        const haystack = [
          row.title,
          row.description,
          row.short_description,
          row.full_description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    return NextResponse.json(results);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load resources";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
