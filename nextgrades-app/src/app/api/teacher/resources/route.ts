import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireTeacherOrAdmin } from "@/lib/auth/auth-utils";
import {
  canPublishLibraryMaterials,
  PUBLISH_FORBIDDEN_MESSAGE,
} from "@/lib/resources/teacher-publishing";
import { LEGACY_TYPE_MAP, type ContentType } from "@/lib/resources/constants";
import { resolveClassIds } from "@/lib/resources/publish-validation";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const auth = await requireTeacherOrAdmin(supabase);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.error === "Forbidden" ? 403 : 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const isAdmin = auth.profile?.role === "admin";

    let query = supabase
      .from("materials")
      .select(
        `
        *,
        category:resource_categories(id, name, icon),
        folder:resource_folders(id, name),
        resource_tag_relations(tag_id, resource_tags(id, name, slug, color))
      `,
        { count: "exact" }
      );

    if (!isAdmin) {
      query = query.eq("created_by", auth.user.id);
    }

    if (status === "pending_review") {
      query = query.eq("moderation_status", "pending").eq("status", "draft");
    } else if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (category && category !== "all") query = query.eq("category_id", category);
    if (search) query = query.ilike("title", `%${search}%`);

    query = query.order(sortBy as "created_at", { ascending: sortOrder === "asc" });

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      resources: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch resources";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const auth = await requireTeacherOrAdmin(supabase);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.error === "Forbidden" ? 403 : 401 });
    }

    if (!canPublishLibraryMaterials(auth.profile?.role)) {
      return NextResponse.json({ error: PUBLISH_FORBIDDEN_MESSAGE }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      short_description,
      full_description,
      content_type = "learning_material",
      type,
      url,
      thumbnail_url,
      file_size,
      category_id,
      tags,
      tag_ids,
      status = "draft",
      access_type = "free",
      price = 0,
      difficulty_level = "beginner",
      age_range = "all_ages",
      estimated_minutes,
      language = "en",
    } = body;

    if (!title || !url) {
      return NextResponse.json({ error: "Title and URL are required" }, { status: 400 });
    }

    const wantsPublish = status === "published";
    const classIds = resolveClassIds(body.class_ids, body.class_id);
    if (wantsPublish) {
      const subjectId = body.subject_id ? String(body.subject_id).trim() : "";
      if (!subjectId || classIds.length === 0) {
        return NextResponse.json(
          { error: "Subject and grade are required to publish to the Library." },
          { status: 400 }
        );
      }
    }

    const ct = content_type as ContentType;
    const isAdmin = auth.profile?.role === "admin";
    const isPublished = wantsPublish && isAdmin;

    const { data: resource, error: resourceError } = await supabase
      .from("materials")
      .insert({
        title,
        description: short_description || description || full_description,
        short_description,
        full_description,
        content_type: ct,
        type: type || LEGACY_TYPE_MAP[ct] || "other",
        url,
        thumbnail_url,
        file_size,
        category_id,
        tags,
        status: isPublished ? "published" : wantsPublish && !isAdmin ? "draft" : status,
        access_type,
        price: access_type === "premium" ? price : 0,
        is_premium: access_type === "premium",
        difficulty_level,
        age_range,
        estimated_minutes,
        language,
        created_by: auth.user.id,
        subject_id: body.subject_id || null,
        class_id: classIds[0] ?? null,
        class_ids: classIds,
        moderation_status: isPublished ? "approved" : wantsPublish ? "pending" : null,
        publish_date: isPublished ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (resourceError) throw resourceError;

    const tagList = tag_ids || tags || [];
    if (tagList.length > 0) {
      await supabase.from("resource_tag_relations").insert(
        tagList.map((tagId: string) => ({ resource_id: resource.id, tag_id: tagId }))
      );
    }

    return NextResponse.json(resource, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create resource";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
