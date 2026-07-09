"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ZoomMeetingButton } from "@/components/zoom/ZoomMeetingButton";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@/lib/i18n/locales";
import {
  fetchStudentLessons,
  fetchTeacherLessons,
  fetchTeacherStudents,
  fetchTeacherStats,
  fetchStudentEnrollments,
  fetchCompletedLessonsCount,
  fetchMaterials,
  fetchProfilesByRole,
  fetchAdminStats,
  fetchCurrentProfile,
  updateProfile,
  computeEnrollmentProgress,
  getSessionUserId,
  type DashboardLesson,
  type DashboardProfile,
  type TeacherStudentRow,
} from "@/lib/dashboard/data";
import {
  Calendar,
  Clock,
  FileText,
  Upload,
  TrendingUp,
  CreditCard,
  Settings,
  Video,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { StudentQuizHub } from "@/components/quiz/StudentQuizHub";
import { AdminTable, AdminTableStatusBadge } from "@/components/admin/AdminTable";
import { st } from "@/components/dashboard/student/student-ui";
import { cn } from "@/lib/utils";

function SectionGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function LessonCards({
  lessons,
  locale,
  showStudent,
}: {
  lessons: DashboardLesson[];
  locale: string;
  showStudent?: boolean;
}) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const muted = "text-text-muted";
  const text = "text-foreground";
  const dateLocale = getDateLocale(locale);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(dateLocale, { weekday: "long", day: "numeric", month: "long" });
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" });

  return (
    <SectionGrid>
      {lessons.map((lesson) => (
        <Card key={lesson.id} className={`p-6`}>
          <Badge variant="gold" className="mb-3">
            {lesson.status}
          </Badge>
          <h3 className={`font-bold text-lg mb-1 ${text}`}>{lesson.subject_name ?? "-"}</h3>
          <p className={`text-sm mb-2 ${muted}`}>
            <Clock className="w-4 h-4 inline mr-1" />
            {formatDate(lesson.start_time)} · {formatTime(lesson.start_time)}
          </p>
          <p className={`text-sm ${muted}`}>
            {t("dashboardCommon.with", { defaultValue: "with" })}{" "}
            {showStudent ? lesson.student_name : lesson.teacher_name ?? "-"}
          </p>
          {(lesson.zoom_meeting_id || lesson.zoom_link) ? (
            <div className="mt-4 w-full">
              <ZoomMeetingButton lessonId={lesson.id} mode="join" className="w-full justify-center" />
            </div>
          ) : null}
        </Card>
      ))}
    </SectionGrid>
  );
}

export function StudentAppointmentsSection() {
  const { t, i18n } = useTranslation();
  const [lessons, setLessons] = useState<DashboardLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const uid = await getSessionUserId();
      if (uid) setLessons(await fetchStudentLessons(uid));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button variant="gold" href="/consultation">
          <Calendar className="w-4 h-4 mr-2" />
          {t("consultation.bookNow")}
        </Button>
        <Button variant="outline" href="/dashboard/student">
          {t("dashboardCommon.showAll", { defaultValue: "Back to dashboard" })}
        </Button>
      </div>
      {loading ? (
        <LoadingBlock />
      ) : lessons.length === 0 ? (
        <EmptyState
          title={t("studentDashboard.noAppointments")}
          description={t("studentDashboard.bookWithTeacher")}
          action={
            <Button variant="gold" href="/consultation">
              {t("consultation.bookNow")}
            </Button>
          }
        />
      ) : (
        <LessonCards lessons={lessons} locale={i18n.language} />
      )}
    </div>
  );
}

export function StudentCoursesSection() {
  const { t } = useTranslation();
  const [enrollments, setEnrollments] = useState<Awaited<ReturnType<typeof fetchStudentEnrollments>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const uid = await getSessionUserId();
      if (uid) setEnrollments(await fetchStudentEnrollments(uid));
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingBlock />;

  if (!enrollments.length) {
    return (
      <EmptyState
        title={t("dashboardPages.student.courses.title")}
        description={t("programsPage.sectionDesc")}
        action={
          <Button variant="gold" href="/programs">
            {t("home.explorePrograms", { defaultValue: "Explore programs" })}
          </Button>
        }
      />
    );
  }

  return (
    <SectionGrid>
      {enrollments.map((e) => {
        const progress = e.status === "completed" ? 100 : e.status === "active" ? 50 : 25;
        return (
          <Card key={e.id} className={`p-6`}>
            <BookOpen className="w-8 h-8 text-[#D4AF37] mb-3" />
            <h3 className={`font-bold mb-1 text-foreground`}>
              {e.subject_name ?? "-"}
            </h3>
            <p className="text-sm text-text-muted mb-4">
              {e.class_name ?? ""}
              {e.semester ? ` · ${t("resources.filters.semester")} ${e.semester}` : ""}
            </p>
            <Badge variant={e.status === "active" ? "success" : "gold"}>{e.status}</Badge>
            <div className={cn("h-2 rounded-full overflow-hidden mt-4", st.progressTrackMd)}>
              <div className={st.progressBar} style={{ width: `${progress}%` }} />
            </div>
          </Card>
        );
      })}
    </SectionGrid>
  );
}

export function StudentResourcesSection() {
  const { t } = useTranslation();
  const [materials, setMaterials] = useState<Awaited<ReturnType<typeof fetchMaterials>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setMaterials(await fetchMaterials({ limit: 6 }));
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-4">
      <Button variant="gold" href="/resources">
        {t("studentDashboard.allMaterials")}
      </Button>
      {!materials.length ? (
        <EmptyState title={t("studentDashboard.newMaterials")} description={t("resources.heroSubtitle")} />
      ) : (
        <SectionGrid>
          {materials.map((m) => (
            <Card key={m.id} className="p-6">
              <FileText className="w-8 h-8 text-[#D4AF37] mb-3" />
              <h3 className="font-bold">{m.title}</h3>
              <p className="text-sm text-text-muted mt-1 line-clamp-2">{m.description}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => m.url && window.open(m.url, "_blank", "noopener,noreferrer")}
              >
                {t("dashboardCommon.download")}
              </Button>
            </Card>
          ))}
        </SectionGrid>
      )}
    </div>
  );
}

export function StudentQuizzesSection() {
  return <StudentQuizHub />;
}

export function StudentProgressSection() {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [materialCount, setMaterialCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const uid = await getSessionUserId();
      if (uid) {
        const [enrollments, done, materials] = await Promise.all([
          fetchStudentEnrollments(uid),
          fetchCompletedLessonsCount(uid),
          fetchMaterials({ limit: 100 }),
        ]);
        setProgress(computeEnrollmentProgress(enrollments));
        setCompleted(done);
        setMaterialCount(materials.length);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingBlock />;

  const stats = [
    { label: t("studentDashboard.learningProgress"), value: `${progress}%` },
    { label: t("dashboardPages.student.appointments.title"), value: String(completed) },
    { label: t("studentDashboard.newMaterials"), value: String(materialCount) },
  ];

  return (
    <SectionGrid>
      {stats.map((s) => (
        <Card key={s.label} className={`p-6`}>
          <TrendingUp className="w-8 h-8 text-[#D4AF37] mb-3" />
          <p className={`text-3xl font-bold text-foreground`}>{s.value}</p>
          <p className="text-text-muted">{s.label}</p>
        </Card>
      ))}
    </SectionGrid>
  );
}

export function StudentSettingsSection() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const profile = await fetchCurrentProfile();
      setFullName(profile?.full_name ?? "");
      setLoading(false);
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await updateProfile(fullName);
    setSaving(false);
    if (error) toast.error(error);
    else toast.success(t("dashboardCommon.saved", { defaultValue: "Settings saved" }));
  };

  if (loading) return <LoadingBlock />;

  return (
    <Card className={`p-8 max-w-xl`}>
      <h3 className={`font-bold mb-6 flex items-center gap-2 text-foreground`}>
        <Settings className="w-5 h-5" /> {t("dashboardPages.student.settings.title")}
      </h3>
      <form className="space-y-4" onSubmit={handleSave}>
        <input
          className={`w-full rounded-xl border px-4 py-3 ${
            theme === "dark" ? "bg-[#0D1B2A] border-white/15 text-white" : "border-gray-200"
          }`}
          placeholder={t("login.fullName")}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Button variant="gold" type="submit" disabled={saving}>
          {saving ? t("login.loading") : t("dashboardCommon.save", { defaultValue: "Save changes" })}
        </Button>
      </form>
    </Card>
  );
}

export function TeacherStudentsSection() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const [students, setStudents] = useState<TeacherStudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const uid = await getSessionUserId();
      if (uid) setStudents(await fetchTeacherStudents(uid, i18n.language));
      setLoading(false);
    })();
  }, [i18n.language]);

  if (loading) return <LoadingBlock />;

  if (!students.length) {
    return (
      <EmptyState
        title={t("teacherDashboard.myStudents")}
        description={t("teacherDashboard.planWithStudents")}
      />
    );
  }

  return (
    <Card className={`overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className={theme === "dark" ? "bg-[#0D1B2A]" : "bg-gray-50"}>
            <tr>
              <th className="px-6 py-4 text-left">{t("dashboardPages.teacher.students.title")}</th>
              <th className="px-6 py-4 text-left">{t("resources.filters.subject")}</th>
              <th className="px-6 py-4 text-left">{t("teacherDashboard.nextLesson")}</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t border-gray-100 dark:border-white/10">
                <td className="px-6 py-4 font-medium">{s.name}</td>
                <td className="px-6 py-4">{s.subject}</td>
                <td className="px-6 py-4">{s.next_lesson}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function TeacherScheduleSection() {
  const { t, i18n } = useTranslation();
  const [lessons, setLessons] = useState<DashboardLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const uid = await getSessionUserId();
      if (uid) setLessons(await fetchTeacherLessons(uid));
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingBlock />;

  if (!lessons.length) {
    return (
      <EmptyState
        title={t("teacherDashboard.noAppointments")}
        description={t("teacherDashboard.planWithStudents")}
        action={
          <Button variant="gold" href="/dashboard/teacher/schedule">
            {t("teacherDashboard.viewSchedule", { defaultValue: "View schedule" })}
          </Button>
        }
      />
    );
  }

  return <LessonCards lessons={lessons} locale={i18n.language} showStudent />;
}

export function TeacherResourcesSection() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [resources, setResources] = useState<
    Array<{ id: string; title: string; status: string; view_count: number; thumbnail_url: string | null }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/teacher/resources?limit=6&sortBy=created_at&sortOrder=desc")
      .then((r) => (r.ok ? r.json() : { resources: [] }))
      .then((data) => setResources(data.resources || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="gold" href="/dashboard/teacher/upload">
          {t("teacherDashboard.uploadMaterial")}
        </Button>
        <Button variant="outline" href="/dashboard/teacher/content">
          {t("teacherDashboard.manageContent", { defaultValue: "Manage all content" })}
        </Button>
      </div>

      {resources.length === 0 ? (
        <Card className="border-2 border-dashed border-[#D4AF37]/40 p-8 text-center">
          <Upload className="mx-auto mb-4 h-12 w-12 text-[#D4AF37]" />
          <p className="mb-4 font-medium">{t("teacherDashboard.uploadMaterial")}</p>
          <Button variant="gold" href="/dashboard/teacher/upload">
            {t("teacherDashboard.uploadFirst", { defaultValue: "Upload your first resource" })}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource.id} className={`overflow-hidden`}>
              <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-[#D4AF37]/20 to-[#4DA3FF]/20">
                {resource.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resource.thumbnail_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <FileText className="h-10 w-10 text-[#D4AF37]" />
                )}
              </div>
              <div className="p-4">
                <h3 className={`line-clamp-2 font-semibold text-foreground`}>
                  {resource.title}
                </h3>
                <p className="mt-1 text-xs capitalize text-gray-500">{resource.status.replace("_", " ")}</p>
                <p className="mt-2 text-sm text-gray-500">
                  {resource.view_count} {t("teacherDashboard.views", { defaultValue: "views" })}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  href={`/dashboard/teacher/content/${resource.id}/edit`}
                >
                  {t("teacherDashboard.editResource", { defaultValue: "Edit" })}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function TeacherEarningsSection() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchTeacherStats>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const uid = await getSessionUserId();
      if (uid) setStats(await fetchTeacherStats(uid));
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingBlock />;

  const items = stats
    ? [
        { label: t("teacherDashboard.earningsMonth"), value: `€${stats.earnings_month.toLocaleString()}` },
        { label: t("teacherDashboard.lessonsThisWeek", { defaultValue: "Lessons this week" }), value: String(stats.lessons_week) },
        { label: t("teacherDashboard.assignedStudents"), value: String(stats.total_students) },
      ]
    : [];

  return (
    <SectionGrid>
      {items.map((s) => (
        <Card key={s.label} className={`p-6`}>
          <CreditCard className="w-8 h-8 text-[#D4AF37] mb-3" />
          <p className={`text-2xl font-bold text-foreground`}>{s.value}</p>
          <p className="text-gray-500">{s.label}</p>
        </Card>
      ))}
    </SectionGrid>
  );
}

export function TeacherSettingsSection() {
  return <StudentSettingsSection />;
}

export function AdminProfilesTable({ role }: { role: "student" | "teacher" }) {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<DashboardProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setProfiles(await fetchProfilesByRole(role));
      setLoading(false);
    })();
  }, [role]);

  const title =
    role === "student" ? t("dashboardPages.admin.students.title") : t("dashboardPages.admin.teachers.title");

  return (
    <AdminTable
      title={title}
      columns={[
        {
          id: "name",
          header: t("login.fullName"),
          sortable: true,
          sortValue: (u) => u.full_name ?? "",
          cell: (u) => u.full_name ?? "-",
        },
        {
          id: "role",
          header: t("login.iAmA"),
          cell: (u) => <AdminTableStatusBadge label={u.role} variant="gold" />,
        },
        {
          id: "joined",
          header: t("dashboardCommon.joined", { defaultValue: "Joined" }),
          sortable: true,
          sortValue: (u) => u.created_at ?? "",
          cell: (u) => (
            <span className="text-sm text-text-muted">
              {u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}
            </span>
          ),
        },
      ]}
      data={profiles}
      getRowId={(u) => u.id}
      loading={loading}
      emptyState={{ title, description: t("adminDashboard.noActivityDesc") }}
    />
  );
}

export function AdminTableSection({ type }: { type: "students" | "teachers" | "payments" }) {
  if (type === "payments") {
    return <AdminEnrollmentsSection />;
  }
  const role = type === "students" ? "student" : "teacher";
  return <AdminProfilesTable role={role} />;
}

function AdminEnrollmentsSection() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<{ id: string; status: string; student_name: string; subject_name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { supabase } = await import("@/lib/supabase/client");
      const { data } = await supabase
        .from("enrollments")
        .select("id, status, student_id, subject_id")
        .limit(50);
      type EnrollmentRow = { id: string; status: string; student_id: string; subject_id: string };
      const enrollmentRows = (data || []) as EnrollmentRow[];
      if (enrollmentRows.length) {
        const studentIds = [...new Set(enrollmentRows.map((e) => e.student_id))];
        const subjectIds = [...new Set(enrollmentRows.map((e) => e.subject_id).filter(Boolean))];
        const [profiles, subjects] = await Promise.all([
          supabase.from("profiles").select("id, full_name").in("id", studentIds),
          subjectIds.length
            ? supabase.from("subjects").select("id, name").in("id", subjectIds)
            : Promise.resolve({ data: [] }),
        ]);
        const nameMap = new Map<string, string>(
          (profiles.data || []).map((p: { id: string; full_name: string | null }) => [
            p.id,
            p.full_name ?? "-",
          ])
        );
        const subjectMap = new Map<string, string>(
          (subjects.data || []).map((s: { id: string; name: string }) => [s.id, s.name])
        );
        setRows(
          enrollmentRows.map((e) => ({
            id: e.id,
            status: e.status,
            student_name: nameMap.get(e.student_id) ?? "-",
            subject_name: subjectMap.get(e.subject_id) ?? "-",
          }))
        );
      }
      setLoading(false);
    })();
  }, []);

  return (
    <AdminTable
      columns={[
        {
          id: "student",
          header: t("login.fullName"),
          sortable: true,
          sortValue: (r) => r.student_name,
          cell: (r) => r.student_name,
        },
        {
          id: "subject",
          header: t("resources.filters.subject"),
          sortable: true,
          sortValue: (r) => r.subject_name,
          cell: (r) => r.subject_name,
        },
        {
          id: "status",
          header: t("dashboardCommon.status", { defaultValue: "Status" }),
          cell: (r) => (
            <AdminTableStatusBadge
              label={r.status}
              variant={r.status === "active" ? "success" : "gold"}
            />
          ),
        },
      ]}
      data={rows}
      loading={loading}
      emptyState={{ title: t("dashboardPages.admin.payments.title") }}
    />
  );
}

export function AdminAnalyticsSection() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchAdminStats>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setStats(await fetchAdminStats());
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingBlock />;

  const items = stats
    ? [
        { label: t("adminDashboard.students"), value: String(stats.total_students) },
        { label: t("adminDashboard.teachers"), value: String(stats.total_teachers) },
        {
          label: t("adminDashboard.activeCourses"),
          value: String(stats.active_enrollments),
        },
        {
          label: t("adminDashboard.totalRevenue"),
          value: `€${stats.total_earnings.toLocaleString()}`,
        },
      ]
    : [];

  return (
    <SectionGrid>
      {items.map((s) => (
        <Card key={s.label} className={`p-6`}>
          <p className={`text-3xl font-bold text-foreground`}>{s.value}</p>
          <p className="text-gray-500">{s.label}</p>
        </Card>
      ))}
    </SectionGrid>
  );
}
