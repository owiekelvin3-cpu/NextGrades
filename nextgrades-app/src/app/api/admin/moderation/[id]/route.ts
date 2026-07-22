import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/auth-utils";

// PUT - Approve or reject a resource
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return moderateResource(request, params);
}

// PATCH alias for older admin UI clients
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return moderateResource(request, params);
}

async function moderateResource(
  request: Request,
  params: Promise<{ id: string }>
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await requireRole(supabase, "admin");
    
    if (!auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { moderation_status, moderation_notes } = body;

    if (!["approved", "rejected"].includes(moderation_status)) {
      return NextResponse.json(
        { error: "Invalid moderation status" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("materials")
      .update({
        moderation_status,
        moderation_notes,
        moderated_by: auth.user.id,
        moderated_at: new Date().toISOString(),
        status: moderation_status === "approved" ? "published" : "draft",
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    const { notifyModerationResult, notifyResourcePublished } = await import("@/lib/notifications/triggers");
    if (data?.created_by) {
      void notifyModerationResult({
        teacherId: data.created_by,
        materialId: id,
        title: data.title ?? "Material",
        approved: moderation_status === "approved",
      });
      if (moderation_status === "approved") {
        void notifyResourcePublished({
          materialId: id,
          title: data.title ?? "Material",
          teacherId: data.created_by,
          subjectId: data.subject_id,
          isPublished: true,
        });
      }
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Error updating moderation status:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update moderation status" },
      { status: 500 }
    );
  }
}
