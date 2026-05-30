import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/auth-utils";

// GET - Fetch a single resource by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await requireAuth(supabase);
    
    if (!auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: resource, error } = await supabase
      .from("materials")
      .select(`
        *,
        category:resource_categories(id, name, icon),
        folder:resource_folders(id, name),
        profiles:profiles(id, full_name, avatar_url),
        resource_tag_relations(tag_id, resource_tags(id, name, slug, color))
      `)
      .eq("id", id)
      .eq("created_by", auth.user.id)
      .single();

    if (error) throw error;
    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    return NextResponse.json(resource);
  } catch (error: any) {
    console.error("Error fetching resource:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch resource" },
      { status: 500 }
    );
  }
}

// PUT - Update a resource
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await requireAuth(supabase);
    
    if (!auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Verify ownership
    const { data: existing } = await supabase
      .from("materials")
      .select("created_by")
      .eq("id", id)
      .single();

    if (!existing || existing.created_by !== auth.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      title,
      description,
      type,
      url,
      thumbnail_url,
      file_size,
      subject_id,
      class_id,
      semester,
      category_id,
      tags,
      status,
      access_type,
      price,
      publish_date,
      expiry_date,
      folder_id
    } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (url !== undefined) updateData.url = url;
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
    if (file_size !== undefined) updateData.file_size = file_size;
    if (subject_id !== undefined) updateData.subject_id = subject_id;
    if (class_id !== undefined) updateData.class_id = class_id;
    if (semester !== undefined) updateData.semester = semester;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (tags !== undefined) updateData.tags = tags;
    if (status !== undefined) updateData.status = status;
    if (access_type !== undefined) updateData.access_type = access_type;
    if (price !== undefined) updateData.price = price;
    if (publish_date !== undefined) updateData.publish_date = publish_date;
    if (expiry_date !== undefined) updateData.expiry_date = expiry_date;
    if (folder_id !== undefined) updateData.folder_id = folder_id;

    // If status changed to published, reset moderation status
    if (status === "published") {
      updateData.moderation_status = "pending";
    }

    const { data: resource, error } = await supabase
      .from("materials")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Update tag relations if tags changed
    if (tags !== undefined) {
      // Delete existing relations
      await supabase
        .from("resource_tag_relations")
        .delete()
        .eq("resource_id", id);

      // Add new relations
      if (tags.length > 0) {
        const tagRelations = tags.map((tagId: string) => ({
          resource_id: id,
          tag_id: tagId
        }));

        await supabase
          .from("resource_tag_relations")
          .insert(tagRelations);
      }
    }

    return NextResponse.json(resource);
  } catch (error: any) {
    console.error("Error updating resource:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update resource" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a resource
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await requireAuth(supabase);
    
    if (!auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from("materials")
      .select("created_by")
      .eq("id", id)
      .single();

    if (!existing || existing.created_by !== auth.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete tag relations first
    await supabase
      .from("resource_tag_relations")
      .delete()
      .eq("resource_id", id);

    // Delete analytics
    await supabase
      .from("resource_analytics")
      .delete()
      .eq("resource_id", id);

    // Delete the resource
    const { error } = await supabase
      .from("materials")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting resource:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete resource" },
      { status: 500 }
    );
  }
}
