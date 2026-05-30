import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile, requireRole } from "@/lib/quiz/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { profile, error } = await getAuthProfile(supabase);
    if (!profile) return NextResponse.json({ error }, { status: 401 });
    if (!requireRole(profile, ["teacher", "admin"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: material, error: fetchError } = await supabase
      .from("uploaded_materials")
      .select("storage_path, uploaded_by")
      .eq("id", id)
      .single();

    if (fetchError || !material) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (profile.role === "teacher" && material.uploaded_by !== profile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (material.storage_path) {
      await supabase.storage.from("learning-materials").remove([material.storage_path]);
    }

    const { error: deleteError } = await supabase.from("uploaded_materials").delete().eq("id", id);
    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
