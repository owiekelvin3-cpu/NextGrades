import { NextResponse } from "next/server";
import { requireAuthenticatedApi } from "@/lib/auth/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { createNotification, createNotificationsForRole } from "@/lib/notifications/server";
import { sendContactFormEmails } from "@/lib/email";

type RequestBody = {
  subjectId?: string;
  preferredDate?: string;  // ISO date string e.g. "2026-06-20"
  preferredTime?: string;  // e.g. "15:00"
  message?: string;
  teacherId?: string;      // optional — if student wants a specific teacher
};

/**
 * Student requests a new appointment.
 * - Creates an in-app notification for teachers (or a specific teacher)
 * - Sends an email to admin for follow-up
 * - Rate limited to 5 requests per hour
 */
export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, { bucket: "appointments:request", limit: 5, windowSec: 3600 });
  if (limited) return limited;

  const gate = await requireAuthenticatedApi();
  if (gate.error) return gate.error;

  const profile = gate.auth!.profile;
  if (profile.role !== "student") {
    return NextResponse.json({ error: "Only students can request appointments." }, { status: 403 });
  }

  const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;

  let body: RequestBody = {};
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { subjectId, preferredDate, preferredTime, message, teacherId } = body;

  if (!message?.trim() && !preferredDate) {
    return NextResponse.json({ error: "Please provide a preferred date or message." }, { status: 400 });
  }

  // Resolve subject name for display
  let subjectName: string | undefined;
  if (subjectId) {
    const { data: subject } = await db
      .from("subjects")
      .select("name")
      .eq("id", subjectId)
      .maybeSingle();
    subjectName = subject?.name as string | undefined;
  }

  const studentName = profile.full_name || "A student";
  const dateDisplay = preferredDate
    ? `${preferredDate}${preferredTime ? ` at ${preferredTime}` : ""}`
    : "flexible";

  const notifMessage = [
    `${studentName} requested a new appointment.`,
    subjectName ? `Subject: ${subjectName}` : null,
    `Preferred time: ${dateDisplay}`,
    message?.trim() ? `Note: ${message.trim()}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  // Notify a specific teacher or all teachers
  if (teacherId) {
    await createNotification({
      userId: teacherId,
      type: "info",
      category: "message",
      title: "New appointment request",
      message: notifMessage,
      actionUrl: `/dashboard/teacher/schedule`,
      entityType: "profile",
      entityId: profile.id,
    });
  } else {
    await createNotificationsForRole("teacher", {
      type: "info",
      category: "message",
      title: "New appointment request",
      message: notifMessage,
      actionUrl: `/dashboard/teacher/schedule`,
      entityType: "profile",
      entityId: profile.id,
    });
  }

  // Also notify admins
  await createNotificationsForRole("admin", {
    type: "info",
    category: "system",
    title: "Student appointment request",
    message: notifMessage,
    actionUrl: `/portal/admin/users`,
    entityType: "profile",
    entityId: profile.id,
  });

  // Send email to admin as a backup
  void sendContactFormEmails(
    studentName,
    profile.email || "",
    [
      `Student appointment request`,
      `Subject: ${subjectName || "Not specified"}`,
      `Preferred time: ${dateDisplay}`,
      message?.trim() ? `Message: ${message.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    "Appointment Request"
  );

  return NextResponse.json({ success: true, message: "Appointment request sent." });
}
