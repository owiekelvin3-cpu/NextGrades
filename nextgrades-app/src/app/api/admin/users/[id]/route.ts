import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/auth-utils";
import { sendTeacherApprovedEmail, sendTeacherRejectedEmail, sendAdminNotificationEmail } from "@/lib/email";

// PATCH - Update user (suspend/activate, change role)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await requireRole(supabase, "admin");
    
    if (!auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { is_active, role, teacher_status, rejection_reason } = body;

    const { data: before } = await supabase
      .from("profiles")
      .select("role, full_name, email")
      .eq("id", id)
      .maybeSingle();

    const { data, error } = await supabase
      .from("profiles")
      .update({
        is_active: is_active !== undefined ? is_active : undefined,
        role: role !== undefined ? role : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    const userEmail = (data as { email?: string }).email || (before as { email?: string } | null)?.email;
    const userName = data.full_name || before?.full_name;

    if (userEmail && role !== undefined && before?.role !== role) {
      if (role === "teacher") {
        void sendTeacherApprovedEmail(userEmail, userName ?? undefined);
      }
    }

    if (userEmail && teacher_status === "rejected") {
      void sendTeacherRejectedEmail(userEmail, userName ?? undefined, rejection_reason);
    }

    if (teacher_status === "approved" && userEmail) {
      void sendTeacherApprovedEmail(userEmail, userName ?? undefined);
      const { notifyTeacherApproved } = await import("@/lib/notifications/triggers");
      void notifyTeacherApproved(id, true);
    }

    if (teacher_status === "rejected") {
      const { notifyTeacherApproved } = await import("@/lib/notifications/triggers");
      void notifyTeacherApproved(id, false);
    }

    // Log the action
    await supabase.from("user_activity_log").insert({
      user_id: auth.user.id,
      action: is_active !== undefined ? (is_active ? "activate_user" : "suspend_user") : "update_user_role",
      metadata: {
        target_user_id: id,
        changes: body
      }
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user (mark as inactive)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await requireRole(supabase, "admin");
    
    if (!auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prevent deleting yourself
    if (id === auth.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Mark user as inactive instead of deleting
    const { error } = await supabase
      .from("profiles")
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) throw error;

    // Log the action
    await supabase.from("user_activity_log").insert({
      user_id: auth.user.id,
      action: "delete_user",
      metadata: {
        target_user_id: id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
