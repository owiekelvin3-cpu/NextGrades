import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-auth";
import {
  activateUserAccount,
  deleteUserAccount,
  suspendUserAccount,
} from "@/lib/auth/admin-user-actions";
import { sendTeacherApprovedEmail, sendTeacherRejectedEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";

type RouteParams = { params: Promise<{ id: string }> };

function guardSelfAction(adminId: string, targetId: string, action: string) {
  if (targetId === adminId) {
    return NextResponse.json({ error: `You cannot ${action} your own account` }, { status: 400 });
  }
  return null;
}

// PATCH - Suspend/activate, change role
export async function PATCH(request: Request, { params }: RouteParams) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  try {
    const { id } = await params;
    const selfBlock = guardSelfAction(gate.auth!.user.id, id, "modify");
    if (selfBlock) return selfBlock;

    const body = await request.json();
    const { is_active, role, teacher_status, rejection_reason, add_units } = body;

    if (is_active !== undefined) {
      if (!isSupabaseServiceRoleConfigured()) {
        return NextResponse.json(
          { error: "SUPABASE_SERVICE_ROLE_KEY required to suspend or activate users." },
          { status: 503 }
        );
      }

      if (is_active) {
        await activateUserAccount(id, gate.auth!.user.id);
      } else {
        await suspendUserAccount(id, gate.auth!.user.id);
      }

      const admin = createAdminClient();
      const { data, error } = await admin.from("profiles").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return NextResponse.json(data);
    }

    const admin = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;

    const addUnits = Number(add_units);
    const subtractUnits = Number(body.subtract_units);
    const adjustUnits = Number(body.adjust_units);
    const setRemainingRaw = body.remaining_units;
    const hasSetRemaining = setRemainingRaw !== undefined && setRemainingRaw !== null;
    const setRemaining = hasSetRemaining ? Number(setRemainingRaw) : NaN;

    const hasUnitAdjustment =
      (Number.isFinite(addUnits) && addUnits > 0 && addUnits <= 200) ||
      (Number.isFinite(subtractUnits) && subtractUnits > 0 && subtractUnits <= 200) ||
      (Number.isFinite(adjustUnits) && adjustUnits !== 0 && Math.abs(adjustUnits) <= 200) ||
      (hasSetRemaining && Number.isFinite(setRemaining) && setRemaining >= 0 && setRemaining <= 500);

    if (hasUnitAdjustment) {
      const { data: target } = await admin.from("profiles").select("id, role").eq("id", id).maybeSingle();
      if (!target || target.role !== "student") {
        return NextResponse.json({ error: "Lesson packages can only be adjusted for students" }, { status: 400 });
      }

      const { data: units } = await admin
        .from("user_units")
        .select("remaining_units, total_units")
        .eq("student_id", id)
        .maybeSingle();

      let remaining = Number(units?.remaining_units ?? 0);
      let total = Number(units?.total_units ?? 0);

      if (Number.isFinite(addUnits) && addUnits > 0) {
        remaining += addUnits;
        total += addUnits;
      }

      if (Number.isFinite(subtractUnits) && subtractUnits > 0) {
        remaining = Math.max(0, remaining - subtractUnits);
      }

      if (Number.isFinite(adjustUnits) && adjustUnits !== 0) {
        if (adjustUnits > 0) {
          remaining += adjustUnits;
          total += adjustUnits;
        } else {
          remaining = Math.max(0, remaining + adjustUnits);
        }
      }

      if (hasSetRemaining && Number.isFinite(setRemaining)) {
        remaining = Math.max(0, Math.floor(setRemaining));
        if (remaining > total) total = remaining;
      }

      remaining = Math.max(0, remaining);
      const used = Math.max(0, total - remaining);
      if (total < used) total = used + remaining;

      if (units) {
        await admin
          .from("user_units")
          .update({ remaining_units: remaining, total_units: total, updated_at: new Date().toISOString() })
          .eq("student_id", id);
      } else {
        await admin.from("user_units").insert({
          student_id: id,
          remaining_units: remaining,
          total_units: total,
        });
      }

      await admin.from("user_activity_log").insert({
        user_id: gate.auth!.user.id,
        action: "adjust_lesson_units",
        metadata: {
          target_user_id: id,
          add_units: Number.isFinite(addUnits) && addUnits > 0 ? addUnits : undefined,
          subtract_units: Number.isFinite(subtractUnits) && subtractUnits > 0 ? subtractUnits : undefined,
          adjust_units: Number.isFinite(adjustUnits) && adjustUnits !== 0 ? adjustUnits : undefined,
          remaining_units: hasSetRemaining ? remaining : undefined,
          remaining,
          total,
        },
      });

      const { data: profile } = await admin.from("profiles").select("*").eq("id", id).maybeSingle();
      return NextResponse.json({ ...profile, remaining_units: remaining, total_units: total });
    }

    const { data: before } = await admin
      .from("profiles")
      .select("role, full_name, email")
      .eq("id", id)
      .maybeSingle();

    const { data, error } = await admin
      .from("profiles")
      .update({
        role: role !== undefined ? role : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    const userEmail = (data as { email?: string }).email || before?.email;
    const userName = data.full_name || before?.full_name;

    if (userEmail && role !== undefined && before?.role !== role && role === "teacher") {
      void sendTeacherApprovedEmail(userEmail, userName ?? undefined);
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

    await admin.from("user_activity_log").insert({
      user_id: gate.auth!.user.id,
      action: "update_user_role",
      metadata: { target_user_id: id, changes: body },
    });

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update user";
    console.error("Error updating user:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - Permanently delete user from auth + database
export async function DELETE(_request: Request, { params }: RouteParams) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  try {
    const { id } = await params;
    const selfBlock = guardSelfAction(gate.auth!.user.id, id, "delete");
    if (selfBlock) return selfBlock;

    if (!isSupabaseServiceRoleConfigured()) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY required to permanently delete users." },
        { status: 503 }
      );
    }

    const admin = createAdminClient();
    const { data: target } = await admin.from("profiles").select("role").eq("id", id).maybeSingle();

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (target.role === "admin") {
      const { count } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin")
        .eq("is_active", true);
      if ((count ?? 0) <= 1) {
        return NextResponse.json({ error: "Cannot delete the last active admin account" }, { status: 400 });
      }
    }

    await deleteUserAccount(id, gate.auth!.user.id);

    return NextResponse.json({ success: true, deleted: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete user";
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
