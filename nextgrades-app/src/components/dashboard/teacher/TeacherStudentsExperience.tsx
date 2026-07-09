"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Video,
  Mail,
  Phone,
  FileText,
  Download,
  Pin,
  MoreHorizontal,
  ChevronLeft,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@/lib/i18n/locales";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { TeacherDashboardLayout } from "./TeacherDashboardLayout";
import { ZoomMeetingButton } from "@/components/zoom/ZoomMeetingButton";
import {
  TEACHER_AVATAR_COLORS,
  formatTeacherEuro,
  studentInitials,
  teacherPanel,
  tt,
} from "./teacher-ui";
import { cn } from "@/lib/utils";
import {
  fetchTeacherOverviewData,
  type TeacherOverviewData,
  type TeacherStudentOverview,
} from "@/lib/dashboard/teacher-overview";

type TabId = "overview" | "appointments" | "progress" | "payments" | "materials" | "notes";

const TABS: { id: TabId; labelKey: string }[] = [
  { id: "overview", labelKey: "teacherDashboard.tabs.overview" },
  { id: "appointments", labelKey: "teacherDashboard.tabs.appointments" },
  { id: "progress", labelKey: "teacherDashboard.tabs.progress" },
  { id: "payments", labelKey: "teacherDashboard.tabs.payments" },
  { id: "materials", labelKey: "teacherDashboard.tabs.materials" },
  { id: "notes", labelKey: "teacherDashboard.tabs.notes" },
];

function formatTimeRange(start: string, durationMin: number, locale: string) {
  const s = new Date(start);
  const e = new Date(s.getTime() + durationMin * 60 * 1000);
  const fmt = (d: Date) => d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  return `${fmt(s)} – ${fmt(e)}`;
}

function StudentDetailPanel({
  student,
  data,
  locale,
  onBack,
}: {
  student: TeacherStudentOverview;
  data: TeacherOverviewData;
  locale: string;
  onBack?: () => void;
}) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const studentLessons = data.upcomingLessons.filter((l) => l.student_id === student.id);
  const bookedHours = student.totalHours;
  const targetHours = Math.max(20, Math.ceil(bookedHours / 5) * 5);
  const remainingHours = Math.max(0, targetHours - bookedHours);
  const progressPct = Math.min(100, Math.round((bookedHours / targetHours) * 100));

  const lastPayment = data.recentPayments.find((p) => p.studentName === student.name);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Profile header */}
      <div className="border-b border-border-default px-4 py-4 sm:px-6 sm:py-5">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#D4AF37] md:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("common.back", { defaultValue: "Back" })}
          </button>
        )}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ backgroundColor: TEACHER_AVATAR_COLORS[0] }}
            >
              {studentInitials(student.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">{student.name}</h2>
                <Badge variant="success">{t("teacherDashboard.statusActive")}</Badge>
              </div>
              <p className="text-sm text-text-muted">{student.subject}</p>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-text-muted">
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {student.name.toLowerCase().replace(/\s+/g, ".")}@example.com
                </span>
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  +49 ··· ···
                </span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" href={`/dashboard/teacher/schedule?student=${student.id}`}>
            {t("teacherDashboard.createForStudent")}
          </Button>
        </div>

        {/* Quick stats */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-surface-subtle px-4 py-3">
            <p className="text-xs text-text-muted">{t("teacherDashboard.hoursBooked")}</p>
            <p className="text-lg font-bold text-foreground">
              {bookedHours} / {targetHours}h
            </p>
          </div>
          <div className="rounded-xl bg-surface-subtle px-4 py-3">
            <p className="text-xs text-text-muted">{t("teacherDashboard.hoursRemaining")}</p>
            <p className="text-lg font-bold text-foreground">{remainingHours}h</p>
          </div>
          <div className="rounded-xl bg-surface-subtle px-4 py-3">
            <p className="text-xs text-text-muted">{t("teacherDashboard.progressLabel")}</p>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-subtle">
                <div className="h-full rounded-full bg-green-500" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="text-sm font-bold text-foreground">{progressPct}%</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-1 overflow-x-auto border-b border-border-default pb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-t-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "border-b-2 border-[#D4AF37] text-[#D4AF37]"
                  : "text-text-muted hover:text-foreground"
              }`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content + sidebar widgets */}
      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-6">
          {activeTab === "overview" && (
            <>
              <div className={teacherPanel()}>
                <div className="flex items-center justify-between border-b border-border-default px-5 py-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    {t("teacherDashboard.upcomingAppointments")}
                  </h3>
                  <Link
                    href={`/dashboard/teacher/schedule?student=${student.id}`}
                    className="text-xs font-medium text-[#D4AF37] hover:underline"
                  >
                    + {t("teacherDashboard.createNewAppointment")}
                  </Link>
                </div>
                {studentLessons.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-text-muted">{t("teacherDashboard.noAppointments")}</p>
                ) : (
                  <ul className="divide-y divide-border-default">
                    {studentLessons.map((lesson) => (
                      <li key={lesson.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(lesson.start_time).toLocaleDateString(locale, {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                            {" · "}
                            {lesson.subject_name || "-"}
                          </p>
                          <p className="text-xs text-text-muted">
                            {formatTimeRange(lesson.start_time, lesson.duration, locale)} · {lesson.duration} min
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {(lesson.zoom_meeting_id || lesson.zoom_link) && (
                            <ZoomMeetingButton lessonId={lesson.id} mode="start" size="sm" />
                          )}
                          <button type="button" className={tt.iconBtn}>
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={teacherPanel()}>
                <div className="border-b border-border-default px-5 py-4">
                  <h3 className="text-sm font-semibold text-foreground">{t("teacherDashboard.availableMaterials")}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
                  {["PDF", "Excel", "Video"].map((type) => (
                    <div
                      key={type}
                      className="flex flex-col items-center rounded-xl border border-border-default bg-surface-subtle p-4 text-center"
                    >
                      <FileText className="h-8 w-8 text-text-muted" />
                      <p className="mt-2 text-xs font-medium text-foreground">
                        {student.subject} - {type}
                      </p>
                      <button type="button" className="mt-2 text-[11px] text-[#D4AF37]">
                        <Download className="mx-auto h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border-default px-5 py-3">
                  <Link href="/dashboard/teacher/content" className="text-xs font-medium text-[#D4AF37] hover:underline">
                    {t("teacherDashboard.manageContent")}
                  </Link>
                </div>
              </div>
            </>
          )}

          {activeTab === "appointments" && (
            <div className={teacherPanel()}>
              <div className="flex items-center justify-between border-b border-border-default px-5 py-4">
                <h3 className="text-sm font-semibold text-foreground">{t("teacherDashboard.allAppointments", { defaultValue: "All appointments" })}</h3>
                <Link href={`/dashboard/teacher/schedule?student=${student.id}`} className="text-xs font-medium text-[#D4AF37] hover:underline">
                  + {t("teacherDashboard.createNewAppointment")}
                </Link>
              </div>
              {data.upcomingLessons.filter((l) => l.student_id === student.id).length === 0 ? (
                <p className="px-5 py-8 text-sm text-text-muted">{t("teacherDashboard.noAppointments")}</p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {data.upcomingLessons.filter((l) => l.student_id === student.id).map((lesson) => (
                    <li key={lesson.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {new Date(lesson.start_time).toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" })}
                          {" · "}{lesson.subject_name || "-"}
                        </p>
                        <p className="text-xs text-text-muted">
                          {formatTimeRange(lesson.start_time, lesson.duration, locale)} · {lesson.duration} min
                          {" · "}
                          <span className={`capitalize font-medium ${lesson.status === "completed" ? "text-green-600" : "text-blue-500"}`}>
                            {lesson.status}
                          </span>
                        </p>
                      </div>
                      {(lesson.zoom_meeting_id || lesson.zoom_link) && (
                        <ZoomMeetingButton lessonId={lesson.id} mode="start" size="sm" />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "progress" && (
            <div className={teacherPanel()}>
              <div className="border-b border-border-default px-5 py-4">
                <h3 className="text-sm font-semibold text-foreground">{t("teacherDashboard.progressLabel")}</h3>
              </div>
              <div className="space-y-5 p-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-surface-subtle px-4 py-3">
                    <p className="text-xs text-text-muted">{t("teacherDashboard.hoursBooked")}</p>
                    <p className="text-xl font-bold text-foreground">{bookedHours}h</p>
                  </div>
                  <div className="rounded-xl bg-surface-subtle px-4 py-3">
                    <p className="text-xs text-text-muted">{t("teacherDashboard.completedLessons", { defaultValue: "Completed lessons" })}</p>
                    <p className="text-xl font-bold text-foreground">{student.lessonCount}</p>
                  </div>
                  <div className="rounded-xl bg-surface-subtle px-4 py-3">
                    <p className="text-xs text-text-muted">{t("teacherDashboard.progressLabel")}</p>
                    <p className="text-xl font-bold text-green-600">{progressPct}%</p>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-text-muted">{t("teacherDashboard.overallProgress", { defaultValue: "Overall progress" })}</p>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                  <p className="mt-1 text-right text-xs text-text-muted">{progressPct}%</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className={teacherPanel()}>
              <div className="border-b border-border-default px-5 py-4">
                <h3 className="text-sm font-semibold text-foreground">{t("teacherDashboard.tabs.payments")}</h3>
              </div>
              {data.recentPayments.filter((p) => p.studentName === student.name).length === 0 ? (
                <p className="px-5 py-8 text-sm text-text-muted">{t("teacherDashboard.noPayments", { defaultValue: "No payment records yet." })}</p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {data.recentPayments.filter((p) => p.studentName === student.name).map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-foreground">{formatTeacherEuro(p.amount)}</p>
                        <p className="text-xs text-text-muted">{new Date(p.date).toLocaleDateString(locale)} · {p.method}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        p.status === "paid" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                      }`}>
                        {p.status === "paid" ? t("teacherDashboard.paid") : t("teacherDashboard.pending", { defaultValue: "Pending" })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "materials" && (
            <div className={teacherPanel()}>
              <div className="flex items-center justify-between border-b border-border-default px-5 py-4">
                <h3 className="text-sm font-semibold text-foreground">{t("teacherDashboard.availableMaterials")}</h3>
                <Link href="/dashboard/teacher/content" className="text-xs font-medium text-[#D4AF37] hover:underline">
                  {t("teacherDashboard.manageContent")}
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
                {["PDF", "Excel", "Video"].map((type) => (
                  <div key={type} className="flex flex-col items-center rounded-xl border border-border-default bg-surface-subtle p-4 text-center">
                    <FileText className="h-8 w-8 text-text-muted" />
                    <p className="mt-2 text-xs font-medium text-foreground">{student.subject} - {type}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className={teacherPanel()}>
              <div className="border-b border-border-default px-5 py-4">
                <h3 className="text-sm font-semibold text-foreground">{t("teacherDashboard.tabs.notes")}</h3>
              </div>
              <div className="p-5">
                <p className="text-sm text-text-muted">{t("teacherDashboard.sampleNote")}</p>
                <button type="button" className="mt-4 text-xs font-medium text-[#D4AF37] hover:underline">
                  + {t("teacherDashboard.addNote")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right widgets */}
        <div className="w-full shrink-0 space-y-4 lg:w-64">
          <div className={teacherPanel("p-5 text-center")}>
            <p className="text-xs font-medium text-text-muted">{t("teacherDashboard.progressLabel")}</p>
            <div className="relative mx-auto my-4 flex h-24 w-24 items-center justify-center">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="3"
                  strokeDasharray={`${progressPct} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-lg font-bold text-foreground">{progressPct}%</span>
            </div>
          </div>

          {lastPayment && (
            <div className={teacherPanel("p-5")}>
              <p className="text-xs font-medium text-text-muted">{t("teacherDashboard.lastPayment")}</p>
              <p className="mt-2 text-xl font-bold text-foreground">{formatTeacherEuro(lastPayment.amount)}</p>
              <p className="text-xs text-text-muted">{new Date(lastPayment.date).toLocaleDateString(locale)}</p>
              <Badge variant="success" className="mt-2">
                {t("teacherDashboard.paid")}
              </Badge>
            </div>
          )}

          <div className={teacherPanel("p-5")}>
            <div className="flex items-center gap-2">
              <Pin className="h-4 w-4 text-[#D4AF37]" />
              <p className="text-xs font-medium text-text-muted">{t("teacherDashboard.tabs.notes")}</p>
            </div>
            <p className="mt-3 text-sm text-text-muted">{t("teacherDashboard.sampleNote")}</p>
            <button type="button" className="mt-3 text-xs font-medium text-[#D4AF37] hover:underline">
              + {t("teacherDashboard.addNote")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeacherStudentsExperience() {
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TeacherOverviewData | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  useEffect(() => {
    fetchTeacherOverviewData()
      .then((d) => {
        setData(d);
        if (d?.students.length && typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
          setSelectedId(d.students[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.students;
    return data.students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.subject.toLowerCase().includes(q)
    );
  }, [data, search]);

  const selected = filtered.find((s) => s.id === selectedId) ?? filtered[0] ?? null;

  const headerActions = (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="md">
        {t("teacherDashboard.export")}
      </Button>
      <Button variant="gold" size="md" href="/consultation">
        <Plus className="mr-2 h-4 w-4" />
        {t("teacherDashboard.addNewStudent")}
      </Button>
    </div>
  );

  if (loading) {
    return (
      <TeacherDashboardLayout title={t("teacherDashboard.nav.students")}>
        <LoadingBlock />
      </TeacherDashboardLayout>
    );
  }

  if (!data) {
    return (
      <TeacherDashboardLayout title={t("teacherDashboard.nav.students")}>
        <div className={`${teacherPanel()} p-10 text-center text-text-muted`}>
          {t("teacherDashboard.signInRequired")}
        </div>
      </TeacherDashboardLayout>
    );
  }

  if (data.students.length === 0) {
    return (
      <TeacherDashboardLayout
        title={t("teacherDashboard.nav.students")}
        description={t("teacherDashboard.studentsSubtitle")}
        topRightAction={headerActions}
      >
        <div className={`${teacherPanel()} p-12 text-center`}>
          <p className="text-text-muted">{t("teacherDashboard.noStudents")}</p>
          <p className="mt-2 text-sm text-text-muted">{t("teacherDashboard.planWithStudents")}</p>
        </div>
      </TeacherDashboardLayout>
    );
  }

  return (
    <TeacherDashboardLayout
      title={t("teacherDashboard.nav.students")}
      description={t("teacherDashboard.studentsSubtitle")}
      topRightAction={headerActions}
      headerAction={<div className="sm:hidden">{headerActions}</div>}
    >
      <div className={cn(teacherPanel(), "flex min-h-0 flex-col overflow-hidden md:min-h-[600px] md:flex-row")}>
        <div
          className={cn(
            "w-full shrink-0 border-border-default md:w-72 md:border-r lg:w-80",
            mobileShowDetail && "hidden md:block"
          )}
        >
          <div className="border-b border-border-default p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("teacherDashboard.searchStudents")}
                  className={cn(tt.input, "py-2 pl-9 pr-3")}
                />
              </div>
              <button type="button" className={cn(tt.iconBtn, "border border-input-border px-2.5")}>
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
          <ul className="max-h-none divide-y divide-border-default overflow-y-auto md:max-h-[520px]">
            {filtered.map((student, i) => (
              <li key={student.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(student.id);
                    setMobileShowDetail(true);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-[var(--table-row-hover)]",
                    selected?.id === student.id
                      ? "border-l-2 border-[#D4AF37] bg-[var(--brand-gold-muted)]"
                      : "hover:bg-[var(--table-row-hover)]"
                  )}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: TEACHER_AVATAR_COLORS[i % TEACHER_AVATAR_COLORS.length] }}
                  >
                    {studentInitials(student.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{student.name}</p>
                    <p className="truncate text-xs text-text-muted">
                      {student.subject} · {student.totalHours}h
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-border-default p-4">
            <Link href="/consultation" className="inline-flex items-center gap-1 text-xs font-medium text-[#D4AF37] hover:underline">
              <Plus className="h-3.5 w-3.5" />
              {t("teacherDashboard.addNewStudent")}
            </Link>
          </div>
        </div>

        {selected ? (
          <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col", !mobileShowDetail && "hidden md:flex")}>
            <StudentDetailPanel
              student={selected}
              data={data}
              locale={locale}
              onBack={() => setMobileShowDetail(false)}
            />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-text-muted md:hidden">
            {t("teacherDashboard.selectStudent", { defaultValue: "Select a student to view details" })}
          </div>
        )}
      </div>
    </TeacherDashboardLayout>
  );
}
