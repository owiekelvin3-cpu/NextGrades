import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireTeacherOrAdmin } from "@/lib/auth/auth-utils";
import { LEGACY_TYPE_MAP, type ContentType } from "@/lib/resources/constants";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await requireTeacherOrAdmin(supabase);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.error === "Forbidden" ? 403 : 401 });
    }

    const isAdmin = auth.profile?.role === "admin";

    let fetchQuery = supabase
      .from("materials")
      .select(`
        *,
        category:resource_categories(id, name, icon),
        folder:resource_folders(id, name),
        resource_tag_relations(tag_id, resource_tags(id, name, slug, color))
      `)
      .eq("id", id);

    if (!isAdmin) {
      fetchQuery = fetchQuery.eq("created_by", auth.user.id);
    }

    const { data: resource, error } = await fetchQuery.single();

    if (error || !resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    return NextResponse.json(resource);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch resource";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await requireTeacherOrAdmin(supabase);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.error === "Forbidden" ? 403 : 401 });
    }

    const { data: existing } = await supabase
      .from("materials")
      .select("created_by")
      .eq("id", id)
      .single();

    if (!existing || (existing.created_by !== auth.user.id && auth.profile?.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    const fields = [
      "title", "description", "short_description", "full_description", "content_type",
      "type", "url", "thumbnail_url", "file_size", "category_id", "tags",
      "status", "access_type", "price", "publish_date", "expiry_date", "folder_id",
      "difficulty_level", "age_range", "estimated_minutes", "language",
    ] as const;

    for (const field of fields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    if (body.content_type) {
      updateData.type = body.type || LEGACY_TYPE_MAP[body.content_type as ContentType] || "other";
    }

    if (body.access_type !== undefined) {
      updateData.is_premium = body.access_type === "premium";
      if (body.access_type !== "premium") updateData.price = 0;
    }

    if (body.status === "published") {
      if (auth.profile?.role === "admin") {
        updateData.moderation_status = "approved";
        updateData.publish_date = body.publish_date || new Date().toISOString();
      } else {
        updateData.moderation_status = "pending";
        updateData.status = "draft";
      }
    } else if (body.status === "archived") {
      updateData.status = "archived";
    }

    const { data: resource, error } = await supabase
      .from("materials")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    const tagIds = body.tag_ids ?? body.tags;
    if (tagIds !== undefined) {
      await supabase.from("resource_tag_relations").delete().eq("resource_id", id);
      if (tagIds.length > 0) {
        await supabase.from("resource_tag_relations").insert(
          tagIds.map((tagId: string) => ({ resource_id: id, tag_id: tagId }))
        );
      }
    }

    return NextResponse.json(resource);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update resource";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await requireTeacherOrAdmin(supabase);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.error === "Forbidden" ? 403 : 401 });
    }

    const { data: existing } = await supabase
      .from("materials")
      .select("created_by, storage_path, thumbnail_url")
      .eq("id", id)
      .single();

    if (!existing || (existing.created_by !== auth.user.id && auth.profile?.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await supabase.from("resource_tag_relations").delete().eq("resource_id", id);
    await supabase.from("resource_analytics").delete().eq("resource_id", id);
    await supabase.from("resource_files").delete().eq("resource_id", id);

    const { error } = await supabase.from("materials").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete resource";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();
    const auth = await requireTeacherOrAdmin(supabase);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.error === "Forbidden" ? 403 : 401 });
    }

    const { data: existing } = await supabase
      .from("materials")
      .select("created_by")
      .eq("id", id)
      .single();

    if (!existing || (existing.created_by !== auth.user.id && auth.profile?.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (body.action === "archive") {
      const { data, error } = await supabase
        .from("materials")
        .update({ status: "archived" })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update resource";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
