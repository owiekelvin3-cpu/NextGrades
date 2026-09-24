"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Calendar, Loader2, Pencil, Plus, RefreshCw, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import {
  AdminTable,
  AdminTableActionsMenu,
  AdminTableStatusBadge,
} from "@/components/admin/AdminTable";
import { themeInputClass, themeSelectClass } from "@/lib/theme/form-fields";
import { cn } from "@/lib/utils";
import type { LessonDisplayStatus } from "@/lib/lessons/display-status";

type ProfileOption = { id: string; full_name: string | null; email: string | null };
type CatalogSubject = { id: string; name: string };
type GroupOption = { id: string; name: string; teacherId: string };

type LessonRow = {
  id: string;
  teacherId: string;
  studentId: string;
  subjectId: string | null;
  groupId: string | null;
  startTime: string;
  duration: number;
  status: string;
  displayStatus: LessonDisplayStatus;
  title: string | null;
  notes: string | null;
  timezone: string | null;
  meetingLink: string | null;
  teacherName: string;
  studentName: string;
  subjectName: string | null;
};

type StatusTab = "all" | "upcoming" | "past" | "completed" | "cancelled" | "missed";

const STATUS_TABS: StatusTab[] = ["all", "upcoming", "past", "completed", "cancelled", "missed"];

const DISPLAY_VARIANT: Record<LessonDisplayStatus, "success" | "warning" | "default"> = {
  upcoming: "default",
  completed: "success",
  cancelled: "default",
  missed: "warning",
  no_show: "warning",
};

function displayName(p: ProfileOption | null): string {
  return p?.full_name?.trim() || p?.email || "—";
}

function utcIsoToWallDateTime(iso: string, timeZone: string): { date: string; time: string } {
  const d = new Date(iso);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
      .formatToParts(d)
      .map((p) => [p.type, p.value])
  );
  const hour = parts.hour === "24" ? "00" : parts.hour;
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${hour}:${parts.minute}`,
  };
}

function formatLessonWhen(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function AdminLessonsManager() {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const locale = i18n.language?.startsWith("de") ? "de-AT" : "en-GB";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [teachers, setTeachers] = useState<ProfileOption[]>([]);
  const [students, setStudents] = useState<ProfileOption[]>([]);
  const [subjects, setSubjects] = useState<CatalogSubject[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);

  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [filters, setFilters] = useState({
    studentId: "",
    teacherId: "",
    subjectId: "",
    from: "",
    to: "",
    q: "",
  });

  const [createMode, setCreateMode] = useState<"student" | "group">("student");
  const [createForm, setCreateForm] = useState({
    teacherId: "",
    studentId: "",
    groupId: "",
    subjectId: "",
    date: "",
    startTime: "",
    duration: "60",
    timezone: "Europe/Vienna",
    meetingLink: "",
    title: "",
    notes: "",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editLesson, setEditLesson] = useState<LessonRow | null>(null);
  const [editForm, setEditForm] = useState({
    teacherId: "",
    date: "",
    startTime: "",
    duration: "",
    timezone: "Europe/Vienna",
    meetingLink: "",
    notes: "",
  });
  const editPanelRef = useRef<HTMLDivElement>(null);
  const [editMounted, setEditMounted] = useState(false);

  useEffect(() => setEditMounted(true), []);

  const selectCls = (value: string) => themeSelectClass(value, "w-full");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.studentId) params.set("studentId", filters.studentId);
    if (filters.teacherId) params.set("teacherId", filters.teacherId);
    if (filters.subjectId) params.set("subjectId", filters.subjectId);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (filters.q.trim()) params.set("q", filters.q.trim());
    if (statusTab !== "all") params.set("status", statusTab);
    return params.toString();
  }, [filters, statusTab]);

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/lessons?${queryString}`);
      const data = (await res.json()) as { lessons?: LessonRow[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setLessons(data.lessons ?? []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("adminLessons.fetchFailed", { defaultValue: "Stunden konnten nicht geladen werden." })
      );
    } finally {
      setLoading(false);
    }
  }, [queryString, t, toast]);

  const fetchOptions = useCallback(async () => {
    try {
      const [teachersRes, studentsRes, catalogRes, groupsRes] = await Promise.all([
        fetch("/api/admin/users?role=teacher&limit=200&status=active"),
        fetch("/api/admin/users?role=student&limit=200&status=active"),
        fetch("/api/catalog"),
        fetch("/api/admin/groups"),
      ]);
      const teachersData = teachersRes.ok ? await teachersRes.json() : { users: [] };
      const studentsData = studentsRes.ok ? await studentsRes.json() : { users: [] };
      const catalogData = catalogRes.ok ? await catalogRes.json() : { subjects: [] };
      const groupsData = groupsRes.ok ? await groupsRes.json() : { groups: [] };
      setTeachers(teachersData.users ?? []);
      setStudents(studentsData.users ?? []);
      setSubjects(catalogData.subjects ?? []);
      setGroups(
        (groupsData.groups ?? []).map((g: { id: string; name: string; teacherId: string }) => ({
          id: g.id,
          name: g.name,
          teacherId: g.teacherId,
        }))
      );
    } catch {
      /* non-fatal */
    }
  }, []);

  useEffect(() => {
    void fetchLessons();
  }, [fetchLessons]);

  useEffect(() => {
    void fetchOptions();
  }, [fetchOptions]);

  useEffect(() => {
    if (!editOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [editOpen]);

  useEffect(() => {
    if (!editOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) closeEdit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const openEdit = (row: LessonRow) => {
    const tz = row.timezone || "Europe/Vienna";
    const wall = utcIsoToWallDateTime(row.startTime, tz);
    setEditLesson(row);
    setEditForm({
      teacherId: row.teacherId,
      date: wall.date,
      startTime: wall.time,
      duration: String(row.duration),
      timezone: tz,
      meetingLink: row.meetingLink || "",
      notes: row.notes || "",
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    if (submitting) return;
    setEditOpen(false);
    setEditLesson(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.teacherId || !createForm.date || !createForm.startTime || !createForm.meetingLink.trim()) {
      toast.error(
        t("adminLessons.requiredFields", {
          defaultValue: "Lehrkraft, Datum, Uhrzeit und Meeting-Link sind erforderlich.",
        })
      );
      return;
    }
    if (createMode === "student" && !createForm.studentId) {
      toast.error(t("adminLessons.selectStudent", { defaultValue: "SchülerIn wählen." }));
      return;
    }
    if (createMode === "group" && !createForm.groupId) {
      toast.error(t("adminLessons.selectGroup", { defaultValue: "Gruppe wählen." }));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: createForm.teacherId,
          studentId: createMode === "student" ? createForm.studentId : undefined,
          groupId: createMode === "group" ? createForm.groupId : undefined,
          subjectId: createForm.subjectId || null,
          date: createForm.date,
          startTime: createForm.startTime,
          duration: Number(createForm.duration) || 60,
          timezone: createForm.timezone,
          meetingLink: createForm.meetingLink,
          title: createForm.title.trim() || undefined,
          notes: createForm.notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      toast.success(t("adminLessons.created", { defaultValue: "Stunde geplant." }));
      setCreateForm((f) => ({
        ...f,
        studentId: "",
        groupId: "",
        meetingLink: "",
        title: "",
        notes: "",
      }));
      void fetchLessons();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("adminLessons.createFailed", { defaultValue: "Stunde konnte nicht erstellt werden." })
      );
    } finally {
      setSubmitting(false);
    }
  };

  const patchLesson = async (id: string, patch: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/lessons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(t("adminLessons.updated", { defaultValue: "Stunde aktualisiert." }));
      void fetchLessons();
      return data;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("adminLessons.updateFailed", { defaultValue: "Aktualisierung fehlgeschlagen." })
      );
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLesson) return;
    if (!editForm.date || !editForm.startTime) {
      toast.error(t("adminLessons.requiredFields", { defaultValue: "Datum und Uhrzeit sind erforderlich." }));
      return;
    }
    const result = await patchLesson(editLesson.id, {
      teacherId: editForm.teacherId,
      date: editForm.date,
      startTime: editForm.startTime,
      duration: Number(editForm.duration) || editLesson.duration,
      timezone: editForm.timezone,
      meetingLink: editForm.meetingLink.trim() || undefined,
      notes: editForm.notes.trim() || null,
    });
    if (result) closeEdit();
  };

  const cancelLesson = async (id: string) => {
    if (!confirm(t("adminLessons.confirmCancel", { defaultValue: "Stunde absagen?" }))) return;
    await patchLesson(id, { cancel: true });
  };

  const displayStatusLabel = (status: LessonDisplayStatus) => {
    const keys: Record<LessonDisplayStatus, string> = {
      upcoming: "adminLessons.statusUpcoming",
      completed: "adminLessons.statusCompleted",
      cancelled: "adminLessons.statusCancelled",
      missed: "adminLessons.statusMissed",
      no_show: "adminLessons.statusNo_show",
    };
    const defaults: Record<LessonDisplayStatus, string> = {
      upcoming: "Bevorstehend",
      completed: "Abgeschlossen",
      cancelled: "Abgesagt",
      missed: "Verpasst",
      no_show: "Nicht erschienen",
    };
    return t(keys[status], { defaultValue: defaults[status] });
  };

  const tabLabel = (tab: StatusTab) =>
    t(`adminLessons.tab${tab.charAt(0).toUpperCase()}${tab.slice(1)}`, {
      defaultValue:
        tab === "all"
          ? "Alle"
          : tab === "upcoming"
            ? "Bevorstehend"
            : tab === "past"
              ? "Vergangen"
              : tab === "completed"
                ? "Abgeschlossen"
                : tab === "cancelled"
                  ? "Abgesagt"
                  : "Verpasst",
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatusTab(tab)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              statusTab === tab
                ? "bg-[#D4AF37] text-[#0B1F3A]"
                : "border border-border-default bg-surface-elevated text-text-muted hover:text-foreground"
            )}
          >
            {tabLabel(tab)}
          </button>
        ))}
        <Button type="button" variant="ghost" size="sm" className="ml-auto gap-1.5" onClick={() => void fetchLessons()}>
          <RefreshCw className="h-3.5 w-3.5" />
          {t("adminLessons.refresh", { defaultValue: "Aktualisieren" })}
        </Button>
      </div>

      <div className="grid gap-3 rounded-2xl border border-border-default bg-surface-elevated p-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            {t("adminLessons.filterStudent", { defaultValue: "SchülerIn" })}
          </label>
          <select
            value={filters.studentId}
            onChange={(e) => setFilters((f) => ({ ...f, studentId: e.target.value }))}
            className={selectCls(filters.studentId)}
          >
            <option value="">{t("adminLessons.allStudents", { defaultValue: "Alle SchülerInnen" })}</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {displayName(s)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            {t("adminLessons.filterTeacher", { defaultValue: "Lehrkraft" })}
          </label>
          <select
            value={filters.teacherId}
            onChange={(e) => setFilters((f) => ({ ...f, teacherId: e.target.value }))}
            className={selectCls(filters.teacherId)}
          >
            <option value="">{t("adminLessons.allTeachers", { defaultValue: "Alle Lehrkräfte" })}</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {displayName(teacher)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            {t("adminLessons.filterSubject", { defaultValue: "Fach" })}
          </label>
          <select
            value={filters.subjectId}
            onChange={(e) => setFilters((f) => ({ ...f, subjectId: e.target.value }))}
            className={selectCls(filters.subjectId)}
          >
            <option value="">{t("adminLessons.allSubjects", { defaultValue: "Alle Fächer" })}</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            {t("adminLessons.filterFrom", { defaultValue: "Von" })}
          </label>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
            className={themeInputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            {t("adminLessons.filterTo", { defaultValue: "Bis" })}
          </label>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
            className={themeInputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            {t("adminLessons.searchTitle", { defaultValue: "Titel suchen" })}
          </label>
          <input
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            className={themeInputClass}
            placeholder={t("adminLessons.searchPlaceholder", { defaultValue: "Stundentitel…" })}
          />
        </div>
      </div>

      <form onSubmit={(e) => void handleCreate(e)} className="rounded-2xl border border-border-default bg-surface-elevated p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
          <Calendar className="h-4 w-4 text-[#D4AF37]" />
          {t("adminLessons.createTitle", { defaultValue: "Neue Stunde planen" })}
        </h2>
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCreateMode("student")}
            className={cn(
              "rounded-lg px-3 py-1 text-xs font-medium",
              createMode === "student" ? "bg-[#0B1F3A] text-white" : "border border-border-default text-text-muted"
            )}
          >
            {t("adminLessons.modeStudent", { defaultValue: "Einzelne SchülerIn" })}
          </button>
          <button
            type="button"
            onClick={() => setCreateMode("group")}
            className={cn(
              "rounded-lg px-3 py-1 text-xs font-medium",
              createMode === "group" ? "bg-[#0B1F3A] text-white" : "border border-border-default text-text-muted"
            )}
          >
            {t("adminLessons.modeGroup", { defaultValue: "Gruppe" })}
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">
              {t("adminLessons.teacher", { defaultValue: "Lehrkraft" })}
            </label>
            <select
              value={createForm.teacherId}
              onChange={(e) => setCreateForm((f) => ({ ...f, teacherId: e.target.value }))}
              className={selectCls(createForm.teacherId)}
            >
              <option value="">{t("adminLessons.selectTeacher", { defaultValue: "Lehrkraft wählen" })}</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {displayName(teacher)}
                </option>
              ))}
            </select>
          </div>
          {createMode === "student" ? (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">
                {t("adminLessons.student", { defaultValue: "SchülerIn" })}
              </label>
              <select
                value={createForm.studentId}
                onChange={(e) => setCreateForm((f) => ({ ...f, studentId: e.target.value }))}
                className={selectCls(createForm.studentId)}
              >
                <option value="">{t("adminLessons.selectStudent", { defaultValue: "SchülerIn wählen" })}</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {displayName(student)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">
                {t("adminLessons.group", { defaultValue: "Gruppe" })}
              </label>
              <select
                value={createForm.groupId}
                onChange={(e) => {
                  const groupId = e.target.value;
                  const group = groups.find((g) => g.id === groupId);
                  setCreateForm((f) => ({
                    ...f,
                    groupId,
                    teacherId: group?.teacherId || f.teacherId,
                  }));
                }}
                className={selectCls(createForm.groupId)}
              >
                <option value="">{t("adminLessons.selectGroup", { defaultValue: "Gruppe wählen" })}</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">
              {t("adminLessons.subject", { defaultValue: "Fach" })}
            </label>
            <select
              value={createForm.subjectId}
              onChange={(e) => setCreateForm((f) => ({ ...f, subjectId: e.target.value }))}
              className={selectCls(createForm.subjectId)}
            >
              <option value="">{t("adminTeacherAssignments.optional", { defaultValue: "Optional" })}</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">
              {t("adminLessons.title", { defaultValue: "Titel" })}
            </label>
            <input
              value={createForm.title}
              onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
              className={themeInputClass}
              placeholder={t("adminLessons.titlePlaceholder", { defaultValue: "z. B. Mathematik-Nachhilfe" })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">
              {t("adminLessons.date", { defaultValue: "Datum" })}
            </label>
            <input
              type="date"
              value={createForm.date}
              onChange={(e) => setCreateForm((f) => ({ ...f, date: e.target.value }))}
              className={themeInputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">
              {t("adminLessons.startTime", { defaultValue: "Uhrzeit" })}
            </label>
            <input
              type="time"
              value={createForm.startTime}
              onChange={(e) => setCreateForm((f) => ({ ...f, startTime: e.target.value }))}
              className={themeInputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">
              {t("adminLessons.duration", { defaultValue: "Dauer (Min.)" })}
            </label>
            <input
              type="number"
              min={15}
              step={15}
              value={createForm.duration}
              onChange={(e) => setCreateForm((f) => ({ ...f, duration: e.target.value }))}
              className={themeInputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">
              {t("adminLessons.timezone", { defaultValue: "Zeitzone" })}
            </label>
            <input
              value={createForm.timezone}
              onChange={(e) => setCreateForm((f) => ({ ...f, timezone: e.target.value }))}
              className={themeInputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-text-muted">
              {t("adminLessons.meetingLink", { defaultValue: "Zoom / Meeting-Link" })}
            </label>
            <input
              value={createForm.meetingLink}
              onChange={(e) => setCreateForm((f) => ({ ...f, meetingLink: e.target.value }))}
              className={themeInputClass}
              placeholder="https://"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-text-muted">
              {t("adminLessons.notes", { defaultValue: "Notizen" })}
            </label>
            <textarea
              value={createForm.notes}
              onChange={(e) => setCreateForm((f) => ({ ...f, notes: e.target.value }))}
              className={cn(themeInputClass, "min-h-[72px] resize-y")}
              rows={2}
            />
          </div>
        </div>
        <Button type="submit" variant="gold" disabled={submitting} className="mt-4 gap-2">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {t("adminLessons.create", { defaultValue: "Stunde erstellen" })}
        </Button>
      </form>

      <AdminTable<LessonRow>
        title={t("adminLessons.listTitle", { defaultValue: "Stunden & Termine" })}
        loading={loading}
        data={lessons}
        getRowId={(row) => row.id}
        emptyState={{ title: t("adminLessons.empty", { defaultValue: "Keine Stunden gefunden." }) }}
        columns={[
          {
            id: "when",
            header: t("adminLessons.colWhen", { defaultValue: "Termin" }),
            cell: (row) => (
              <div>
                <p className="font-medium text-foreground">{formatLessonWhen(row.startTime, locale)}</p>
                <p className="text-xs text-text-muted">
                  {row.duration} {t("adminLessons.minutes", { defaultValue: "Min." })}
                </p>
              </div>
            ),
          },
          {
            id: "title",
            header: t("adminLessons.colTitle", { defaultValue: "Titel" }),
            cell: (row) => <span className="text-sm text-foreground">{row.title || "—"}</span>,
          },
          {
            id: "people",
            header: t("adminLessons.colPeople", { defaultValue: "Lehrkraft / SchülerIn" }),
            cell: (row) => (
              <span className="text-sm text-text-muted">
                {row.teacherName} · {row.studentName}
              </span>
            ),
          },
          {
            id: "subject",
            header: t("adminLessons.colSubject", { defaultValue: "Fach" }),
            cell: (row) => <span className="text-sm text-text-muted">{row.subjectName || "—"}</span>,
          },
          {
            id: "link",
            header: t("adminLessons.colLink", { defaultValue: "Meeting" }),
            cell: (row) =>
              row.meetingLink ? (
                <a
                  href={row.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[#D4AF37] hover:underline"
                >
                  {t("adminLessons.openLink", { defaultValue: "Link öffnen" })}
                </a>
              ) : (
                <span className="text-xs text-text-muted">—</span>
              ),
          },
          {
            id: "status",
            header: t("adminLessons.colStatus", { defaultValue: "Status" }),
            cell: (row) => (
              <AdminTableStatusBadge
                variant={DISPLAY_VARIANT[row.displayStatus]}
                label={displayStatusLabel(row.displayStatus)}
              />
            ),
          },
          {
            id: "actions",
            header: "",
            align: "right",
            width: "3rem",
            cell: (row) =>
              row.status !== "cancelled" ? (
                <AdminTableActionsMenu
                  actions={[
                    {
                      id: "edit",
                      label: t("adminLessons.edit", { defaultValue: "Bearbeiten" }),
                      onClick: () => openEdit(row),
                      icon: Pencil,
                    },
                    {
                      id: "cancel",
                      label: t("adminLessons.cancel", { defaultValue: "Absagen" }),
                      onClick: () => void cancelLesson(row.id),
                      variant: "danger",
                      icon: XCircle,
                    },
                  ]}
                />
              ) : null,
          },
        ]}
      />

      {editMounted && editOpen && editLesson
        ? createPortal(
            <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
              <button
                type="button"
                className="absolute inset-0 bg-[#0B1F3A]/60 backdrop-blur-sm"
                aria-label={t("adminLessons.closeEdit", { defaultValue: "Schließen" })}
                onClick={closeEdit}
              />
              <div
                ref={editPanelRef}
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
                className="relative z-10 w-full max-w-lg rounded-2xl border border-border-default bg-surface-elevated p-5 shadow-xl"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {t("adminLessons.editTitle", { defaultValue: "Stunde bearbeiten" })}
                    </h3>
                    <p className="text-xs text-text-muted">{editLesson.title || editLesson.studentName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="rounded-lg p-1 text-text-muted hover:bg-surface-muted hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <form onSubmit={(e) => void handleEditSave(e)} className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-text-muted">
                      {t("adminLessons.teacher", { defaultValue: "Lehrkraft" })}
                    </label>
                    <select
                      value={editForm.teacherId}
                      onChange={(e) => setEditForm((f) => ({ ...f, teacherId: e.target.value }))}
                      className={selectCls(editForm.teacherId)}
                    >
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {displayName(teacher)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-text-muted">
                        {t("adminLessons.date", { defaultValue: "Datum" })}
                      </label>
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))}
                        className={themeInputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-text-muted">
                        {t("adminLessons.startTime", { defaultValue: "Uhrzeit" })}
                      </label>
                      <input
                        type="time"
                        value={editForm.startTime}
                        onChange={(e) => setEditForm((f) => ({ ...f, startTime: e.target.value }))}
                        className={themeInputClass}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-text-muted">
                        {t("adminLessons.duration", { defaultValue: "Dauer (Min.)" })}
                      </label>
                      <input
                        type="number"
                        min={15}
                        step={15}
                        value={editForm.duration}
                        onChange={(e) => setEditForm((f) => ({ ...f, duration: e.target.value }))}
                        className={themeInputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-text-muted">
                        {t("adminLessons.timezone", { defaultValue: "Zeitzone" })}
                      </label>
                      <input
                        value={editForm.timezone}
                        onChange={(e) => setEditForm((f) => ({ ...f, timezone: e.target.value }))}
                        className={themeInputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-text-muted">
                      {t("adminLessons.meetingLink", { defaultValue: "Zoom / Meeting-Link" })}
                    </label>
                    <input
                      value={editForm.meetingLink}
                      onChange={(e) => setEditForm((f) => ({ ...f, meetingLink: e.target.value }))}
                      className={themeInputClass}
                      placeholder="https://"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-text-muted">
                      {t("adminLessons.notes", { defaultValue: "Notizen" })}
                    </label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                      className={cn(themeInputClass, "min-h-[72px] resize-y")}
                      rows={2}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button type="submit" variant="gold" disabled={submitting} className="gap-2">
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {t("adminLessons.save", { defaultValue: "Speichern" })}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={submitting}
                      className="text-red-600 hover:text-red-700"
                      onClick={() => void cancelLesson(editLesson.id).then(() => closeEdit())}
                    >
                      {t("adminLessons.cancelLesson", { defaultValue: "Stunde absagen" })}
                    </Button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
