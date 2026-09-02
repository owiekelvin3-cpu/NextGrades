/**
 * High-level notification triggers - call from API routes after domain events.
 */
import {
  createNotification,
  createNotificationsForRole,
  createNotificationsForUsers,
  createNotificationsForAllUsers,
  getStudentIdsForEnrollment,
} from "./server";

import { getAppUrl } from "@/lib/app-url";

const APP = getAppUrl();

export async function notifyResourcePublished(params: {
  materialId: string;
  title: string;
  teacherId: string;
  subjectId?: string | null;
  isPublished: boolean;
}) {
  if (!params.isPublished) return;

  const studentIds = await getStudentIdsForEnrollment(params.subjectId);
  await createNotificationsForUsers(studentIds, {
    type: "success",
    category: "resource",
    title: "Neues Lernmaterial verfügbar",
    message: `"${params.title}" wurde veröffentlicht.`,
    actionUrl: `/resources?id=${params.materialId}`,
    entityType: "material",
    entityId: params.materialId,
  });

  await createNotificationsForRole("admin", {
    type: "info",
    category: "resource",
    title: "Lehrkraft hat neues Material veröffentlicht",
    message: `"${params.title}" wurde veröffentlicht.`,
    actionUrl: `/portal/admin/resources`,
    entityType: "material",
    entityId: params.materialId,
  });
}

/** In-app + push confirmation when a teacher uploads or saves a resource. */
export async function notifyTeacherResourceUploaded(params: {
  teacherId: string;
  materialId: string;
  title: string;
  status: string;
  submittedForReview?: boolean;
  isUpdate?: boolean;
}) {
  const published = params.status === "published" && !params.submittedForReview;
  const submittedForReview = params.submittedForReview === true;
  const isUpdate = params.isUpdate === true;

  await createNotification({
    userId: params.teacherId,
    type: submittedForReview ? "info" : published ? "success" : "info",
    category: "resource",
    title: published
      ? isUpdate
        ? "Material aktualisiert und veröffentlicht"
        : "Material erfolgreich veröffentlicht"
      : submittedForReview
        ? isUpdate
          ? "Aktualisierung zur Prüfung eingereicht"
          : "Zur Prüfung eingereicht"
        : isUpdate
          ? "Entwurf aktualisiert"
          : "Entwurf gespeichert",
    message: published
      ? `"${params.title}" ist jetzt in der Lernbibliothek sichtbar.`
      : submittedForReview
        ? `"${params.title}" liegt in der Admin-Prüfung. Du wirst benachrichtigt, sobald es freigegeben ist.`
        : `"${params.title}" wurde als Entwurf gespeichert. Reiche es zur Prüfung ein, wenn du soweit bist.`,
    actionUrl: submittedForReview
      ? "/dashboard/teacher/content"
      : published
        ? "/dashboard/teacher/content"
        : `/dashboard/teacher/content/${params.materialId}/edit`,
    entityType: "material",
    entityId: params.materialId,
  });
}

export async function notifyAdminModerationPending(params: {
  materialId: string;
  title: string;
  accessType?: string;
  teacherName?: string;
}) {
  const accessLabel = params.accessType === "premium" ? "Premium" : "Kostenlos";
  await createNotificationsForRole("admin", {
    type: "info",
    category: "resource",
    title: "Material wartet auf Prüfung",
    message: `${params.teacherName ?? "Eine Lehrkraft"} hat „${params.title}“ (${accessLabel}) zur Freigabe eingereicht.`,
    actionUrl: "/portal/admin/moderation",
    entityType: "material",
    entityId: params.materialId,
  });
}

export async function notifyLiveClassScheduled(params: {
  lessonId: string;
  studentId: string;
  teacherId: string;
  teacherName?: string;
  subjectName?: string;
  title?: string;
  startTime: string;
  joinUrl?: string;
}) {
  const when = new Date(params.startTime).toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const className = params.title || params.subjectName || "Live-Stunde";
  const teacher = params.teacherName ?? "deine Lehrkraft";

  await createNotification({
    userId: params.studentId,
    type: "info",
    category: "live_class",
    title: "Neue Stunde eingetragen",
    message: `${className} mit ${teacher} – ${when}${params.joinUrl ? " · Zum Termin gibt es einen Video-Link." : ""}`,
    actionUrl: `/dashboard/student/appointments`,
    entityType: "lesson",
    entityId: params.lessonId,
  });

  await createNotification({
    userId: params.teacherId,
    type: "info",
    category: "live_class",
    title: "Stunde gespeichert",
    message: `${className} für ${when} eingetragen.`,
    actionUrl: `/dashboard/teacher/schedule`,
    entityType: "lesson",
    entityId: params.lessonId,
  });
}

export async function notifyLessonCompleted(params: {
  lessonId: string;
  studentId: string;
  teacherId: string;
  title: string;
  attendance: "attended" | "excused" | "no_show";
  deducted: boolean;
}) {
  const attendanceLabel =
    params.attendance === "attended"
      ? "teilgenommen"
      : params.attendance === "excused"
        ? "entschuldigt gefehlt"
        : "nicht erschienen";

  await createNotification({
    userId: params.studentId,
    type: params.attendance === "attended" ? "success" : "info",
    category: "live_class",
    title: "Stunde abgeschlossen",
    message: `"${params.title}" wurde als ${attendanceLabel} markiert.${
      params.deducted ? " Eine Unterrichtseinheit wurde abgezogen." : ""
    }`,
    actionUrl: `/dashboard/student/appointments`,
    entityType: "lesson",
    entityId: params.lessonId,
  });

  await createNotificationsForRole("admin", {
    type: "info",
    category: "live_class",
    title: "Stunde abgeschlossen",
    message: `"${params.title}" – Status: ${attendanceLabel}${
      params.deducted ? " · Einheit abgezogen" : ""
    }.`,
    actionUrl: `/portal/admin/teacher-payroll`,
    entityType: "lesson",
    entityId: params.lessonId,
  });
}

export async function notifyEnrollment(params: {
  studentId: string;
  subjectName?: string;
  teacherId?: string | null;
}) {
  await createNotification({
    userId: params.studentId,
    type: "success",
    category: "enrollment",
    title: "Anmeldung bestätigt",
    message: params.subjectName
      ? `Du bist für ${params.subjectName} angemeldet.`
      : "Deine Anmeldung ist aktiv.",
    actionUrl: "/dashboard/student/courses",
  });

  if (params.teacherId) {
    await createNotification({
      userId: params.teacherId,
      type: "info",
      category: "enrollment",
      title: "Neue Schüleranmeldung",
      message: "Eine Schülerin oder ein Schüler hat sich für deinen Kurs angemeldet.",
      actionUrl: "/dashboard/teacher/students",
    });
  }
}

export async function notifyPaymentReceived(params: {
  userId: string;
  amount: string;
  description?: string;
}) {
  await createNotification({
    userId: params.userId,
    type: "success",
    category: "account",
    title: "Zahlung eingegangen",
    message: params.description ?? `Zahlung über ${params.amount} bestätigt.`,
    actionUrl: "/dashboard/student/settings",
  });
}

export async function notifyTeacherApproved(userId: string, approved: boolean) {
  await createNotification({
    userId,
    type: approved ? "success" : "warning",
    category: "account",
    title: approved ? "Lehrkonto freigeschaltet" : "Update zu deiner Lehrkraft-Bewerbung",
    message: approved
      ? "Dein Lehrkonto wurde freigeschaltet. Du kannst jetzt Materialien veröffentlichen."
      : "Deine Lehrkraft-Bewerbung braucht noch Aufmerksamkeit.",
    actionUrl: "/dashboard/teacher",
  });
}

export async function notifyAccountVerification(userId: string) {
  await createNotification({
    userId,
    type: "success",
    category: "account",
    title: "E-Mail bestätigt",
    message: "Deine E-Mail-Adresse wurde erfolgreich bestätigt.",
    actionUrl: "/dashboard/student/settings",
  });
}

export async function notifyPasswordReset(userId: string) {
  await createNotification({
    userId,
    type: "warning",
    category: "account",
    title: "Passwort geändert",
    message: "Dein Passwort wurde zurückgesetzt. Wenn du das nicht warst, kontaktiere den Support.",
    actionUrl: "/dashboard/student/settings",
  });
}

export async function notifyQuizSubmitted(params: {
  teacherId?: string | null;
  studentId: string;
  quizTitle: string;
  attemptId: string;
}) {
  await createNotification({
    userId: params.studentId,
    type: "success",
    category: "submission",
    title: "Quiz abgegeben",
    message: `"${params.quizTitle}" wurde erfolgreich abgegeben.`,
    actionUrl: "/dashboard/student/quizzes",
    entityType: "quiz_attempt",
    entityId: params.attemptId,
  });

  if (params.teacherId) {
    await createNotification({
      userId: params.teacherId,
      type: "info",
      category: "submission",
      title: "Neue Quiz-Abgabe",
      message: `Eine Schülerin oder ein Schüler hat „${params.quizTitle}“ abgegeben.`,
      actionUrl: "/dashboard/teacher/analytics",
      entityType: "quiz_attempt",
      entityId: params.attemptId,
    });
  }
}

export async function notifyGradeReleased(params: {
  studentId: string;
  title: string;
  score?: string;
}) {
  await createNotification({
    userId: params.studentId,
    type: "success",
    category: "grade",
    title: "Note veröffentlicht",
    message: params.score
      ? `${params.title}: ${params.score}`
      : `Deine Note für „${params.title}“ ist verfügbar.`,
    actionUrl: "/dashboard/student/progress",
  });
}

export async function notifyAssignmentAssigned(params: {
  studentIds: string[];
  title: string;
  materialId?: string;
}) {
  await createNotificationsForUsers(params.studentIds, {
    type: "info",
    category: "assignment",
    title: "Neue Aufgabe",
    message: `"${params.title}" wurde dir zugewiesen.`,
    actionUrl: params.materialId ? `/resources?id=${params.materialId}` : "/dashboard/student/resources",
    entityType: "material",
    entityId: params.materialId,
  });
}

export async function notifyAdminNewRegistration(params: {
  userId: string;
  role: string;
  name?: string;
}) {
  await createNotificationsForRole("admin", {
    type: "info",
    category: "system",
    title: "Neue Registrierung",
    message: `${params.name || "Jemand"} hat sich als ${
      params.role === "teacher" ? "Lehrkraft" : params.role === "admin" ? "Administrator" : "SchülerIn"
    } registriert.`,
    actionUrl: `/portal/admin/users`,
    entityType: "profile",
    entityId: params.userId,
  });
}

export async function notifyModerationResult(params: {
  teacherId: string;
  materialId: string;
  title: string;
  approved: boolean;
}) {
  await createNotification({
    userId: params.teacherId,
    type: params.approved ? "success" : "warning",
    category: "resource",
    title: params.approved ? "Material freigegeben" : "Material braucht Überarbeitung",
    message: `"${params.title}" wurde von der Prüfung ${params.approved ? "freigegeben" : "abgelehnt"}.`,
    actionUrl: `/dashboard/teacher/content/${params.materialId}/edit`,
    entityType: "material",
    entityId: params.materialId,
  });
}

export async function notifyAnnouncement(params: {
  title: string;
  message: string;
  actionUrl?: string;
  audience: "all" | "students" | "teachers" | "admins";
}) {
  const input = {
    type: "info" as const,
    category: "announcement" as const,
    title: params.title,
    message: params.message,
    actionUrl: params.actionUrl ?? `${APP}/dashboard/notifications`,
  };

  if (params.audience === "all") return createNotificationsForAllUsers(input);
  if (params.audience === "students") return createNotificationsForRole("student", input);
  if (params.audience === "teachers") return createNotificationsForRole("teacher", input);
  return createNotificationsForRole("admin", input);
}

export async function notifyMessageReceived(params: {
  userId: string;
  title: string;
  preview: string;
}) {
  await createNotification({
    userId: params.userId,
    type: "info",
    category: "message",
    title: params.title,
    message: params.preview,
    actionUrl: "/dashboard/chat",
  });
}

export async function notifyExamPublished(params: {
  studentIds: string[];
  title: string;
  materialId?: string;
}) {
  await createNotificationsForUsers(params.studentIds, {
    type: "info",
    category: "exam",
    title: "Neue Prüfung verfügbar",
    message: `"${params.title}" wurde veröffentlicht.`,
    actionUrl: params.materialId ? `/resources?id=${params.materialId}` : "/dashboard/student/quizzes",
    entityType: "material",
    entityId: params.materialId,
  });
}
