/**
 * High-level notification triggers — call from API routes after domain events.
 */
import {
  createNotification,
  createNotificationsForRole,
  createNotificationsForUsers,
  createNotificationsForAllUsers,
  getStudentIdsForEnrollment,
} from "./server";

const APP = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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
    title: "New learning material available",
    message: `"${params.title}" has been published.`,
    actionUrl: `/resources?id=${params.materialId}`,
    entityType: "material",
    entityId: params.materialId,
  });

  await createNotificationsForRole("admin", {
    type: "info",
    category: "resource",
    title: "Teacher published new material",
    message: `"${params.title}" was published.`,
    actionUrl: `/dashboard/admin/resources`,
    entityType: "material",
    entityId: params.materialId,
  });
}

export async function notifyLiveClassScheduled(params: {
  lessonId: string;
  studentId: string;
  teacherId: string;
  subjectName?: string;
  startTime: string;
}) {
  const when = new Date(params.startTime).toLocaleString();
  await createNotification({
    userId: params.studentId,
    type: "info",
    category: "live_class",
    title: "Live class scheduled",
    message: params.subjectName
      ? `${params.subjectName} — ${when}`
      : `Your lesson is scheduled for ${when}.`,
    actionUrl: `/dashboard/student/appointments`,
    entityType: "lesson",
    entityId: params.lessonId,
  });

  await createNotification({
    userId: params.teacherId,
    type: "info",
    category: "live_class",
    title: "Live class scheduled",
    message: `Lesson scheduled for ${when}.`,
    actionUrl: `/dashboard/teacher/schedule`,
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
    title: "Enrollment confirmed",
    message: params.subjectName
      ? `You are enrolled in ${params.subjectName}.`
      : "Your enrollment is active.",
    actionUrl: "/dashboard/student/courses",
  });

  if (params.teacherId) {
    await createNotification({
      userId: params.teacherId,
      type: "info",
      category: "enrollment",
      title: "New student enrollment",
      message: "A student enrolled in your course.",
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
    title: "Payment received",
    message: params.description ?? `Payment of ${params.amount} confirmed.`,
    actionUrl: "/dashboard/student/settings",
  });
}

export async function notifyTeacherApproved(userId: string, approved: boolean) {
  await createNotification({
    userId,
    type: approved ? "success" : "warning",
    category: "account",
    title: approved ? "Teacher account approved" : "Teacher application update",
    message: approved
      ? "Your teacher account has been approved. You can now publish materials."
      : "Your teacher application requires attention.",
    actionUrl: "/dashboard/teacher",
  });
}

export async function notifyAccountVerification(userId: string) {
  await createNotification({
    userId,
    type: "success",
    category: "account",
    title: "Email verified",
    message: "Your email address has been verified successfully.",
    actionUrl: "/dashboard/student/settings",
  });
}

export async function notifyPasswordReset(userId: string) {
  await createNotification({
    userId,
    type: "warning",
    category: "account",
    title: "Password changed",
    message: "Your password was reset. If you did not request this, contact support.",
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
    title: "Quiz submitted",
    message: `"${params.quizTitle}" was submitted successfully.`,
    actionUrl: "/dashboard/student/quizzes",
    entityType: "quiz_attempt",
    entityId: params.attemptId,
  });

  if (params.teacherId) {
    await createNotification({
      userId: params.teacherId,
      type: "info",
      category: "submission",
      title: "New quiz submission",
      message: `A student submitted "${params.quizTitle}".`,
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
    title: "Grade released",
    message: params.score
      ? `${params.title}: ${params.score}`
      : `Your grade for "${params.title}" is available.`,
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
    title: "New assignment",
    message: `"${params.title}" has been assigned to you.`,
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
    title: "New user registration",
    message: `${params.name || "A user"} registered as ${params.role}.`,
    actionUrl: `/dashboard/admin/users`,
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
    title: params.approved ? "Material approved" : "Material needs revision",
    message: `"${params.title}" was ${params.approved ? "approved" : "rejected"} by moderation.`,
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
    title: "New exam available",
    message: `"${params.title}" has been published.`,
    actionUrl: params.materialId ? `/resources?id=${params.materialId}` : "/dashboard/student/quizzes",
    entityType: "material",
    entityId: params.materialId,
  });
}
