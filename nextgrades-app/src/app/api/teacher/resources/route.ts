import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/auth-utils";

// GET - Fetch all resources for the current teacher
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const auth = await requireAuth(supabase);
    
    if (!auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    let query = supabase
      .from("materials")
      .select(`
        *,
        category:resource_categories(id, name, icon),
        folder:resource_folders(id, name),
        profiles:profiles(id, full_name, avatar_url)
      `, { count: "exact" })
      .eq("created_by", auth.user.id);

    // Apply filters
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    
    if (category && category !== "all") {
      query = query.eq("category_id", category);
    }
    
    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy as any, { ascending: sortOrder === "asc" });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      resources: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error: any) {
    console.error("Error fetching teacher resources:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

// POST - Create a new resource
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const auth = await requireAuth(supabase);
    
    if (!auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
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
      status = "draft",
      access_type = "free",
      price = 0,
      publish_date,
      expiry_date,
      folder_id
    } = body;

    // Validate required fields
    if (!title || !type || !url) {
      return NextResponse.json(
        { error: "Title, type, and URL are required" },
        { status: 400 }
      );
    }

    // Create the resource
    const { data: resource, error: resourceError } = await supabase
      .from("materials")
      .insert({
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
        folder_id,
        created_by: auth.user.id,
        moderation_status: "pending"
      })
      .select()
      .single();

    if (resourceError) {
      console.error("Supabase insert error:", resourceError);
      // Check if it's a column doesn't exist error (migration not run)
      if (resourceError.message.includes('column') || resourceError.message.includes('does not exist')) {
        return NextResponse.json(
          { error: "Database migration not run. Please run the migration: supabase/migrations/00004_teacher_cms.sql" },
          { status: 500 }
        );
      }
      throw resourceError;
    }

    // Handle tags if provided
    if (tags && tags.length > 0) {
      const tagRelations = tags.map((tagId: string) => ({
        resource_id: resource.id,
        tag_id: tagId
      }));

      const { error: tagError } = await supabase
        .from("resource_tag_relations")
        .insert(tagRelations);

      if (tagError) {
        console.error("Error adding tag relations:", tagError);
        // Don't fail the request if tags fail
      }
    }

    return NextResponse.json(resource, { status: 201 });
  } catch (error: any) {
    console.error("Error creating resource:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create resource" },
      { status: 500 }
    );
  }
}
