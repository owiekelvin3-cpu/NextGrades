"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Search, ChevronLeft, Calendar, BookOpen, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@/lib/i18n/locales";
import { Button } from "@/components/ui/Button";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { OverviewEmptyState } from "@/components/dashboard/overview/OverviewPrimitives";
import { TeacherDashboardLayout } from "./TeacherDashboardLayout";
import {
  TEACHER_AVATAR_COLORS,
  studentInitials,
  teacherPanel,
  tt,
} from "./teacher-ui";
import { cn } from "@/lib/utils";

type TeacherStudentRow = {
  assignmentId: string;
  studentId: string;
  name: string;
  subject: { id: string; name: string } | null;
  class: { id: string; name: string; level: number | null } | null;
  learningGoal: string | null;
  nextLesson: {
    id: string;
    startTime: string;
    title: string | null;
    status: string;
  } | null;
  completedLessons: number;
  remainingCredits: number;
  openAssignments: number;
  progressPercent: number;
  notesPreview: string | null;
};

async function fetchAssignedStudents(): Promise<TeacherStudentRow[]> {
  const res = await fetch("/api/teacher/students", { credentials: "include" });
  if (res.status === 401 || res.status === 403) return [];
  if (!res.ok) throw new Error("Failed to load students");
  const json = (await res.json()) as { students?: TeacherStudentRow[] };
  return json.students ?? [];
}

function truncate(text: string | null | undefined, max = 48) {
  if (!text) return "—";
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function formatClassLabel(
  cls: TeacherStudentRow["class"],
  t: (key: string, opts?: { defaultValue?: string }) => string
) {
  if (!cls) return "—";
  if (cls.level != null) {
    return `${cls.name} (${t("teacherDashboard.gradeLevelShort", { defaultValue: "Stufe" })} ${cls.level})`;
  }
  return cls.name;
}

function formatNextLesson(
  lesson: TeacherStudentRow["nextLesson"],
  locale: string,
  t: (key: string, opts?: { defaultValue?: string }) => string
) {
  if (!lesson) return "—";
  const start = new Date(lesson.startTime);
  const date = start.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" });
  const time = start.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  const title = lesson.title?.trim();
  return title ? `${date}, ${time} · ${title}` : `${date}, ${time}`;
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl bg-surface-subtle px-4 py-3">
      <p className="text-xs font-medium text-text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function StudentDetailPanel({
  student,
  locale,
  onBack,
  onNotesSaved,
}: {
  student: TeacherStudentRow;
  locale: string;
  onBack?: () => void;
  onNotesSaved: (studentId: string, preview: string) => void;
}) {
  const { t } = useTranslation();
  const [notesBody, setNotesBody] = useState(student.notesPreview ?? "");
  const [notesLoading, setNotesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setNotesLoading(true);
    setSaveMessage(null);
    setNotesBody(student.notesPreview ?? "");

    fetch(`/api/teacher/students/${student.studentId}/notes`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as { body?: string | null };
      })
      .then((data) => {
        if (cancelled) return;
        if (data?.body != null) setNotesBody(data.body);
      })
      .finally(() => {
        if (!cancelled) setNotesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [student.studentId, student.notesPreview]);

  const handleSaveNotes = useCallback(async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch(`/api/teacher/students/${student.studentId}/notes`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: notesBody }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || "Save failed");
      }
      const preview =
        notesBody.trim().length > 160 ? `${notesBody.trim().slice(0, 157)}…` : notesBody.trim();
      onNotesSaved(student.studentId, preview);
      setSaveMessage(t("teacherDashboard.notesSaved", { defaultValue: "Notizen gespeichert." }));
    } catch {
      setSaveMessage(t("teacherDashboard.notesSaveFailed", { defaultValue: "Speichern fehlgeschlagen." }));
    } finally {
      setSaving(false);
    }
  }, [notesBody, onNotesSaved, student.studentId, t]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-border-default px-4 py-4 sm:px-6 sm:py-5">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#D4AF37] md:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("common.back", { defaultValue: "Zurück" })}
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
              <h2 className="text-lg font-bold text-foreground">{student.name}</h2>
              <p className="text-sm text-text-muted">{student.subject?.name ?? "—"}</p>
            </div>
          </div>
          <Button variant="gold" size="sm" href={`/dashboard/teacher/schedule?student=${student.studentId}`}>
            {t("teacherDashboard.scheduleLesson", { defaultValue: "Stunde planen" })}
          </Button>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-text-muted">
            <span>{t("teacherDashboard.progressPercent", { defaultValue: "Fortschritt" })}</span>
            <span className="font-semibold text-foreground">{student.progressPercent}%</span>
          </div>
          <div className={tt.progressTrack}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#22C55E] transition-all"
              style={{ width: `${Math.min(100, student.progressPercent)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField
            label={t("teacherDashboard.colSubject", { defaultValue: "Fach" })}
            value={student.subject?.name ?? "—"}
          />
          <DetailField
            label={t("teacherDashboard.gradeLevel", { defaultValue: "Klasse / Stufe" })}
            value={formatClassLabel(student.class, t)}
          />
          <DetailField
            label={t("teacherDashboard.completedLessons", { defaultValue: "Abgeschlossene Stunden" })}
            value={student.completedLessons}
          />
          <DetailField
            label={t("teacherDashboard.remainingCredits", { defaultValue: "Verbleibende Credits" })}
            value={student.remainingCredits}
          />
          <DetailField
            label={t("teacherDashboard.openAssignments", { defaultValue: "Offene Aufgaben" })}
            value={student.openAssignments}
          />
          <DetailField
            label={t("teacherDashboard.nextLesson", { defaultValue: "Nächste Stunde" })}
            value={formatNextLesson(student.nextLesson, locale, t)}
          />
        </div>

        {student.learningGoal && (
          <div className={teacherPanel("p-5")}>
            <div className="mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-[#D4AF37]" />
              <h3 className="text-sm font-semibold text-foreground">
                {t("teacherDashboard.learningGoal", { defaultValue: "Lernziel" })}
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-foreground">{student.learningGoal}</p>
          </div>
        )}

        <div className={teacherPanel("p-5")}>
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#D4AF37]" />
            <h3 className="text-sm font-semibold text-foreground">
              {t("teacherDashboard.internalNotes", { defaultValue: "Interne Notizen" })}
            </h3>
          </div>
          {notesLoading ? (
            <p className="text-sm text-text-muted">{t("common.loading", { defaultValue: "Laden…" })}</p>
          ) : (
            <>
              <textarea
                value={notesBody}
                onChange={(e) => setNotesBody(e.target.value)}
                rows={6}
                placeholder={t("teacherDashboard.internalNotesPlaceholder", {
                  defaultValue: "Private Notizen zu dieser SchülerIn…",
                })}
                className={cn(tt.input, "min-h-[140px] resize-y")}
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button variant="gold" size="sm" onClick={handleSaveNotes} disabled={saving || !notesBody.trim()}>
                  {saving
                    ? t("common.saving", { defaultValue: "Speichern…" })
                    : t("teacherDashboard.saveNotes", { defaultValue: "Notizen speichern" })}
                </Button>
                {saveMessage && <span className="text-xs text-text-muted">{saveMessage}</span>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentMobileCard({
  student,
  locale,
  index,
  onSelect,
}: {
  student: TeacherStudentRow;
  locale: string;
  index: number;
  onSelect: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={cn(tt.card, "p-4")}>
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: TEACHER_AVATAR_COLORS[index % TEACHER_AVATAR_COLORS.length] }}
        >
          {studentInitials(student.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">{student.name}</p>
          <p className="text-xs text-text-muted">
            {student.subject?.name ?? "—"} · {formatClassLabel(student.class, t)}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {t("teacherDashboard.nextLesson", { defaultValue: "Nächste Stunde" })}:{" "}
            {formatNextLesson(student.nextLesson, locale, t)}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {student.progressPercent}% · {student.completedLessons}{" "}
            {t("teacherDashboard.completedLessonsShort", { defaultValue: "abgeschlossen" })}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onSelect}>
          {t("teacherDashboard.viewStudent", { defaultValue: "SchülerIn ansehen" })}
        </Button>
        <Button variant="gold" size="sm" href={`/dashboard/teacher/schedule?student=${student.studentId}`}>
          {t("teacherDashboard.scheduleLesson", { defaultValue: "Stunde planen" })}
        </Button>
      </div>
    </div>
  );
}

export function TeacherStudentsExperience() {
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [students, setStudents] = useState<TeacherStudentRow[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  useEffect(() => {
    fetchAssignedStudents()
      .then((rows) => {
        setStudents(rows);
        if (rows.length && typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
          setSelectedId(rows[0].studentId);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.subject?.name ?? "").toLowerCase().includes(q) ||
        (s.class?.name ?? "").toLowerCase().includes(q) ||
        (s.learningGoal ?? "").toLowerCase().includes(q)
    );
  }, [students, search]);

  const selected = filtered.find((s) => s.studentId === selectedId) ?? filtered[0] ?? null;

  const handleNotesSaved = useCallback((studentId: string, preview: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, notesPreview: preview || null } : s))
    );
  }, []);

  if (loading) {
    return (
      <TeacherDashboardLayout title={t("teacherDashboard.nav.students")}>
        <LoadingBlock />
      </TeacherDashboardLayout>
    );
  }

  if (error) {
    return (
      <TeacherDashboardLayout title={t("teacherDashboard.nav.students")}>
        <div className={`${teacherPanel()} p-10 text-center text-text-muted`}>
          {t("teacherDashboard.loadFailed", { defaultValue: "SchülerInnen konnten nicht geladen werden." })}
        </div>
      </TeacherDashboardLayout>
    );
  }

  if (students.length === 0) {
    return (
      <TeacherDashboardLayout
        title={t("teacherDashboard.nav.students")}
        description={t("teacherDashboard.studentsSubtitle")}
      >
        <div className={teacherPanel()}>
          <OverviewEmptyState
            icon={Calendar}
            title={t("teacherDashboard.noAssignedStudents", {
              defaultValue: "Noch keine SchülerInnen zugewiesen.",
            })}
            description={t("teacherDashboard.assignedByAdminHint", {
              defaultValue: "Die Verwaltung weist dir SchülerInnen zu.",
            })}
          />
        </div>
      </TeacherDashboardLayout>
    );
  }

  return (
    <TeacherDashboardLayout
      title={t("teacherDashboard.nav.students")}
      description={t("teacherDashboard.studentsSubtitle")}
    >
      <div className={cn(teacherPanel(), "flex min-h-0 flex-col overflow-hidden lg:min-h-[640px] lg:flex-row")}>
        <div
          className={cn(
            "flex min-h-0 w-full shrink-0 flex-col border-border-default lg:w-[58%] lg:border-r xl:w-[62%]",
            mobileShowDetail && "hidden lg:flex"
          )}
        >
          <div className="border-b border-border-default p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("teacherDashboard.searchStudents")}
                className={cn(tt.input, "py-2 pl-9 pr-3")}
              />
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden flex-1 overflow-auto lg:block">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className={tt.tableHead}>
                <tr>
                  <th className="px-4 py-3">{t("teacherDashboard.colStudent")}</th>
                  <th className="px-3 py-3">{t("teacherDashboard.colSubject")}</th>
                  <th className="px-3 py-3">{t("teacherDashboard.gradeLevel", { defaultValue: "Klasse / Stufe" })}</th>
                  <th className="px-3 py-3">{t("teacherDashboard.learningGoal", { defaultValue: "Lernziel" })}</th>
                  <th className="px-3 py-3">{t("teacherDashboard.nextLesson")}</th>
                  <th className="px-3 py-3">{t("teacherDashboard.completedLessons", { defaultValue: "Abgeschlossen" })}</th>
                  <th className="px-3 py-3">{t("teacherDashboard.remainingCredits", { defaultValue: "Credits" })}</th>
                  <th className="px-3 py-3">{t("teacherDashboard.openAssignments", { defaultValue: "Offen" })}</th>
                  <th className="px-3 py-3">{t("teacherDashboard.progressPercent", { defaultValue: "Fortschritt" })}</th>
                  <th className="px-3 py-3">{t("teacherDashboard.notesPreview", { defaultValue: "Notizen" })}</th>
                  <th className="px-4 py-3">{t("teacherDashboard.colAction")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {filtered.map((student, i) => {
                  const isSelected = selected?.studentId === student.studentId;
                  return (
                    <tr
                      key={student.assignmentId}
                      className={cn(tt.tableRow, isSelected && "bg-[var(--brand-gold-muted)]")}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                            style={{
                              backgroundColor: TEACHER_AVATAR_COLORS[i % TEACHER_AVATAR_COLORS.length],
                            }}
                          >
                            {studentInitials(student.name)}
                          </div>
                          <span className="font-medium text-foreground">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-text-muted">{student.subject?.name ?? "—"}</td>
                      <td className="px-3 py-3 text-text-muted">{formatClassLabel(student.class, t)}</td>
                      <td className="max-w-[140px] px-3 py-3 text-text-muted">{truncate(student.learningGoal, 40)}</td>
                      <td className="max-w-[160px] px-3 py-3 text-text-muted">
                        {formatNextLesson(student.nextLesson, locale, t)}
                      </td>
                      <td className="px-3 py-3 text-text-muted">{student.completedLessons}</td>
                      <td className="px-3 py-3 text-text-muted">{student.remainingCredits}</td>
                      <td className="px-3 py-3 text-text-muted">{student.openAssignments}</td>
                      <td className="px-3 py-3 font-medium text-foreground">{student.progressPercent}%</td>
                      <td className="max-w-[140px] px-3 py-3 text-text-muted">{truncate(student.notesPreview, 36)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedId(student.studentId)}
                            className="text-left text-xs font-semibold text-[#D4AF37] hover:underline"
                          >
                            {t("teacherDashboard.viewStudent", { defaultValue: "SchülerIn ansehen" })}
                          </button>
                          <Link
                            href={`/dashboard/teacher/schedule?student=${student.studentId}`}
                            className="text-xs font-semibold text-[#D4AF37] hover:underline"
                          >
                            {t("teacherDashboard.scheduleLesson", { defaultValue: "Stunde planen" })}
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-text-muted">
                {t("teacherDashboard.noSearchResults", { defaultValue: "Keine Treffer." })}
              </p>
            )}
          </div>

          {/* Mobile list */}
          <div className="space-y-3 p-4 lg:hidden">
            {filtered.map((student, i) => (
              <StudentMobileCard
                key={student.assignmentId}
                student={student}
                locale={locale}
                index={i}
                onSelect={() => {
                  setSelectedId(student.studentId);
                  setMobileShowDetail(true);
                }}
              />
            ))}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-text-muted">
                {t("teacherDashboard.noSearchResults", { defaultValue: "Keine Treffer." })}
              </p>
            )}
          </div>
        </div>

        {selected ? (
          <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col", !mobileShowDetail && "hidden lg:flex")}>
            <StudentDetailPanel
              student={selected}
              locale={locale}
              onBack={() => setMobileShowDetail(false)}
              onNotesSaved={handleNotesSaved}
            />
          </div>
        ) : (
          <div className="hidden flex-1 items-center justify-center p-8 text-center text-sm text-text-muted lg:flex">
            {t("teacherDashboard.selectStudent", { defaultValue: "SchülerIn auswählen, um Details zu sehen" })}
          </div>
        )}
      </div>
    </TeacherDashboardLayout>
  );
}
