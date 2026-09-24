"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import {
  AdminTable,
  AdminTableActionsMenu,
  AdminTableStatusBadge,
} from "@/components/admin/AdminTable";
import { themeInputClass, themeSelectClass } from "@/lib/theme/form-fields";
type ProfileOption = { id: string; full_name: string | null; email: string | null };
type CatalogSubject = { id: string; name: string };
type CatalogClass = { id: string; name: string; level: number | null };

type GroupRow = {
  id: string;
  name: string;
  isActive: boolean;
  scheduleNotes: string | null;
  meetingUrl: string | null;
  maxStudents: number | null;
  dayOfWeek: number | null;
  startTime: string | null;
  durationMinutes: number | null;
  startDate: string | null;
  teacher: ProfileOption | null;
  teacherId: string;
  subject: { id: string; name: string } | null;
  class: { id: string; name: string; level: number | null } | null;
  members: { studentId: string; name: string }[];
};

type GroupFormState = {
  name: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  scheduleNotes: string;
  meetingUrl: string;
  maxStudents: string;
  dayOfWeek: string;
  startTime: string;
  durationMinutes: string;
  startDate: string;
  isActive: boolean;
  studentIds: string[];
};

const DAY_KEYS = [
  { value: "0", labelKey: "adminGroups.dayMon", default: "Montag" },
  { value: "1", labelKey: "adminGroups.dayTue", default: "Dienstag" },
  { value: "2", labelKey: "adminGroups.dayWed", default: "Mittwoch" },
  { value: "3", labelKey: "adminGroups.dayThu", default: "Donnerstag" },
  { value: "4", labelKey: "adminGroups.dayFri", default: "Freitag" },
  { value: "5", labelKey: "adminGroups.daySat", default: "Samstag" },
  { value: "6", labelKey: "adminGroups.daySun", default: "Sonntag" },
] as const;

function displayName(p: ProfileOption | null): string {
  return p?.full_name?.trim() || p?.email || "—";
}

function emptyForm(): GroupFormState {
  return {
    name: "",
    teacherId: "",
    subjectId: "",
    classId: "",
    scheduleNotes: "",
    meetingUrl: "",
    maxStudents: "",
    dayOfWeek: "",
    startTime: "",
    durationMinutes: "60",
    startDate: "",
    isActive: true,
    studentIds: [],
  };
}

function formFromGroup(row: GroupRow): GroupFormState {
  const timeRaw = row.startTime?.trim() ?? "";
  const timeShort = timeRaw.length >= 5 ? timeRaw.slice(0, 5) : timeRaw;
  return {
    name: row.name,
    teacherId: row.teacherId ?? row.teacher?.id ?? "",
    subjectId: row.subject?.id ?? "",
    classId: row.class?.id ?? "",
    scheduleNotes: row.scheduleNotes ?? "",
    meetingUrl: row.meetingUrl ?? "",
    maxStudents: row.maxStudents != null ? String(row.maxStudents) : "",
    dayOfWeek: row.dayOfWeek != null ? String(row.dayOfWeek) : "",
    startTime: timeShort,
    durationMinutes: row.durationMinutes != null ? String(row.durationMinutes) : "60",
    startDate: row.startDate ?? "",
    isActive: row.isActive,
    studentIds: row.members.map((m) => m.studentId),
  };
}

function payloadFromForm(form: GroupFormState) {
  return {
    name: form.name,
    teacherId: form.teacherId,
    subjectId: form.subjectId || null,
    classId: form.classId || null,
    scheduleNotes: form.scheduleNotes || null,
    meetingUrl: form.meetingUrl || null,
    maxStudents: form.maxStudents.trim() ? Number(form.maxStudents) : null,
    dayOfWeek: form.dayOfWeek === "" ? null : Number(form.dayOfWeek),
    startTime: form.startTime.trim() || null,
    durationMinutes: form.durationMinutes.trim() ? Number(form.durationMinutes) : 60,
    startDate: form.startDate.trim() || null,
    isActive: form.isActive,
    studentIds: form.studentIds,
  };
}

function GroupFormFields({
  form,
  setForm,
  teachers,
  students,
  subjects,
  classes,
  selectCls,
  toggleStudent,
  idPrefix,
  t,
}: {
  form: GroupFormState;
  setForm: React.Dispatch<React.SetStateAction<GroupFormState>>;
  teachers: ProfileOption[];
  students: ProfileOption[];
  subjects: CatalogSubject[];
  classes: CatalogClass[];
  selectCls: (value: string) => string;
  toggleStudent: (id: string) => void;
  idPrefix: string;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-muted">
          {t("adminGroups.name", { defaultValue: "Gruppenname" })}
        </label>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={themeInputClass}
          placeholder="z. B. Mathematik 7. Klasse"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-muted">
          {t("adminGroups.teacher", { defaultValue: "Lehrkraft" })}
        </label>
        <select
          value={form.teacherId}
          onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}
          className={selectCls(form.teacherId)}
        >
          <option value="">{t("adminGroups.selectTeacher", { defaultValue: "Lehrkraft wählen" })}</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {displayName(teacher)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-muted">
          {t("adminTeacherAssignments.subject")}
        </label>
        <select
          value={form.subjectId}
          onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}
          className={selectCls(form.subjectId)}
        >
          <option value="">{t("adminTeacherAssignments.optional")}</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-muted">
          {t("adminTeacherAssignments.class")}
        </label>
        <select
          value={form.classId}
          onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}
          className={selectCls(form.classId)}
        >
          <option value="">{t("adminTeacherAssignments.optional")}</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-muted">
          {t("adminGroups.maxStudents", { defaultValue: "Max. SchülerInnen" })}
        </label>
        <input
          type="number"
          min={1}
          value={form.maxStudents}
          onChange={(e) => setForm((f) => ({ ...f, maxStudents: e.target.value }))}
          className={themeInputClass}
          placeholder="z. B. 8"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-muted">
          {t("adminGroups.dayOfWeek", { defaultValue: "Wochentag" })}
        </label>
        <select
          value={form.dayOfWeek}
          onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: e.target.value }))}
          className={selectCls(form.dayOfWeek)}
        >
          <option value="">{t("adminTeacherAssignments.optional")}</option>
          {DAY_KEYS.map((d) => (
            <option key={d.value} value={d.value}>
              {t(d.labelKey, { defaultValue: d.default })}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-muted">
          {t("adminGroups.startTime", { defaultValue: "Uhrzeit" })}
        </label>
        <input
          type="time"
          value={form.startTime}
          onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
          className={themeInputClass}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-muted">
          {t("adminGroups.durationMinutes", { defaultValue: "Dauer (Min.)" })}
        </label>
        <input
          type="number"
          min={15}
          step={15}
          value={form.durationMinutes}
          onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
          className={themeInputClass}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-muted">
          {t("adminGroups.startDate", { defaultValue: "Startdatum" })}
        </label>
        <input
          type="date"
          value={form.startDate}
          onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
          className={themeInputClass}
        />
      </div>
      <div className="flex items-end">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            className="accent-[#D4AF37]"
          />
          {t("adminGroups.activeGroup", { defaultValue: "Gruppe aktiv" })}
        </label>
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-medium text-text-muted">
          {t("adminGroups.schedule", { defaultValue: "Zeitplan / Notizen" })}
        </label>
        <input
          value={form.scheduleNotes}
          onChange={(e) => setForm((f) => ({ ...f, scheduleNotes: e.target.value }))}
          className={themeInputClass}
          placeholder="z. B. Zusatzinfos zum Termin"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-medium text-text-muted">Zoom / Meeting-URL</label>
        <input
          value={form.meetingUrl}
          onChange={(e) => setForm((f) => ({ ...f, meetingUrl: e.target.value }))}
          className={themeInputClass}
          placeholder="https://"
        />
      </div>
      <div className="sm:col-span-2">
        <p className="mb-2 text-xs font-medium text-text-muted">
          {t("adminGroups.members", { defaultValue: "SchülerInnen" })}
        </p>
        <div
          id={`${idPrefix}-members`}
          className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-border-default p-3"
        >
          {students.length === 0 ? (
            <p className="text-xs text-text-muted">Keine SchülerInnen gefunden.</p>
          ) : (
            students.map((student) => (
              <label key={student.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.studentIds.includes(student.id)}
                  onChange={() => toggleStudent(student.id)}
                  className="accent-[#D4AF37]"
                />
                {displayName(student)}
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminGroupsManager() {
  const { t } = useTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [teachers, setTeachers] = useState<ProfileOption[]>([]);
  const [students, setStudents] = useState<ProfileOption[]>([]);
  const [subjects, setSubjects] = useState<CatalogSubject[]>([]);
  const [classes, setClasses] = useState<CatalogClass[]>([]);
  const [form, setForm] = useState<GroupFormState>(emptyForm);
  const [editGroup, setEditGroup] = useState<GroupRow | null>(null);
  const [editForm, setEditForm] = useState<GroupFormState>(emptyForm);

  const selectCls = (value: string) => themeSelectClass(value, "w-full");

  const dayLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of DAY_KEYS) {
      map.set(d.value, t(d.labelKey, { defaultValue: d.default }));
    }
    return (dow: number | null) => (dow != null ? map.get(String(dow)) ?? "—" : "—");
  }, [t]);

  const formatScheduleCell = useCallback(
    (row: GroupRow) => {
      const parts: string[] = [];
      if (row.dayOfWeek != null) parts.push(dayLabel(row.dayOfWeek));
      if (row.startTime) parts.push(row.startTime.slice(0, 5));
      if (row.durationMinutes) parts.push(`${row.durationMinutes} min`);
      if (row.startDate) parts.push(row.startDate);
      if (row.maxStudents != null) {
        parts.push(
          t("adminGroups.maxShort", {
            defaultValue: "max. {{n}}",
            n: row.maxStudents,
          })
        );
      }
      return parts.length ? parts.join(" · ") : row.scheduleNotes?.trim() || "—";
    },
    [dayLabel, t]
  );

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/groups");
      const data = (await res.json()) as { groups?: GroupRow[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setGroups(data.groups ?? []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("adminGroups.fetchFailed", { defaultValue: "Gruppen konnten nicht geladen werden." })
      );
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

  const fetchOptions = useCallback(async () => {
    try {
      const [teachersRes, studentsRes, catalogRes] = await Promise.all([
        fetch("/api/admin/users?role=teacher&limit=100&status=active"),
        fetch("/api/admin/users?role=student&limit=100&status=active"),
        fetch("/api/catalog"),
      ]);
      const teachersData = teachersRes.ok ? await teachersRes.json() : { users: [] };
      const studentsData = studentsRes.ok ? await studentsRes.json() : { users: [] };
      const catalogData = catalogRes.ok ? await catalogRes.json() : { subjects: [], classes: [] };
      setTeachers(teachersData.users ?? []);
      setStudents(studentsData.users ?? []);
      setSubjects(catalogData.subjects ?? []);
      setClasses(catalogData.classes ?? []);
    } catch {
      /* non-fatal */
    }
  }, []);

  useEffect(() => {
    void fetchGroups();
    void fetchOptions();
  }, [fetchGroups, fetchOptions]);

  const makeToggle =
    (setter: React.Dispatch<React.SetStateAction<GroupFormState>>) => (id: string) => {
      setter((f) => ({
        ...f,
        studentIds: f.studentIds.includes(id) ? f.studentIds.filter((x) => x !== id) : [...f.studentIds, id],
      }));
    };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.teacherId) {
      toast.error(t("adminGroups.requiredFields", { defaultValue: "Name und Lehrkraft sind erforderlich." }));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      toast.success(t("adminGroups.created", { defaultValue: "Gruppe erstellt." }));
      setForm(emptyForm());
      void fetchGroups();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("adminGroups.createFailed", { defaultValue: "Gruppe konnte nicht erstellt werden." })
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (row: GroupRow) => {
    setEditGroup(row);
    setEditForm(formFromGroup(row));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGroup) return;
    if (!editForm.name.trim() || !editForm.teacherId) {
      toast.error(t("adminGroups.requiredFields", { defaultValue: "Name und Lehrkraft sind erforderlich." }));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/groups/${editGroup.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(editForm)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      toast.success(t("adminGroups.updated", { defaultValue: "Gruppe gespeichert." }));
      setEditGroup(null);
      void fetchGroups();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("adminGroups.updateFailed", { defaultValue: "Aktualisierung fehlgeschlagen." })
      );
    } finally {
      setSubmitting(false);
    }
  };

  const archiveGroup = async (id: string) => {
    if (!confirm(t("adminGroups.confirmArchive", { defaultValue: "Gruppe archivieren?" }))) return;
    try {
      const res = await fetch(`/api/admin/groups/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(t("adminGroups.archived", { defaultValue: "Gruppe archiviert." }));
      void fetchGroups();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("adminGroups.updateFailed", { defaultValue: "Aktualisierung fehlgeschlagen." })
      );
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => void handleCreate(e)} className="rounded-2xl border border-border-default bg-surface-elevated p-5">
        <h2 className="mb-4 text-sm font-bold text-foreground">
          {t("adminGroups.createTitle", { defaultValue: "Neue Gruppe anlegen" })}
        </h2>
        <GroupFormFields
          form={form}
          setForm={setForm}
          teachers={teachers}
          students={students}
          subjects={subjects}
          classes={classes}
          selectCls={selectCls}
          toggleStudent={makeToggle(setForm)}
          idPrefix="create"
          t={t}
        />
        <Button type="submit" variant="gold" disabled={submitting} className="mt-4 gap-2">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {t("adminGroups.create", { defaultValue: "Gruppe erstellen" })}
        </Button>
      </form>

      <AdminTable<GroupRow>
        title={t("adminGroups.listTitle", { defaultValue: "Gruppen" })}
        loading={loading}
        data={groups}
        getRowId={(row) => row.id}
        emptyState={{ title: t("adminGroups.empty", { defaultValue: "Noch keine Gruppen." }) }}
        columns={[
          {
            id: "name",
            header: t("adminGroups.name", { defaultValue: "Gruppe" }),
            cell: (row) => <span className="font-medium text-foreground">{row.name}</span>,
          },
          {
            id: "teacher",
            header: t("adminGroups.teacher", { defaultValue: "Lehrkraft" }),
            cell: (row) => <span className="text-sm text-text-muted">{displayName(row.teacher)}</span>,
          },
          {
            id: "schedule",
            header: t("adminGroups.scheduleCol", { defaultValue: "Termin" }),
            cell: (row) => <span className="text-sm text-text-muted">{formatScheduleCell(row)}</span>,
          },
          {
            id: "subject",
            header: t("adminTeacherAssignments.colSubject"),
            cell: (row) => (
              <span className="text-sm text-text-muted">
                {[row.subject?.name, row.class?.name].filter(Boolean).join(" · ") || "—"}
              </span>
            ),
          },
          {
            id: "members",
            header: t("adminGroups.members", { defaultValue: "SchülerInnen" }),
            cell: (row) => (
              <span className="text-sm text-text-muted">
                {row.members.length ? row.members.map((m) => m.name).join(", ") : "—"}
              </span>
            ),
          },
          {
            id: "status",
            header: t("adminTeacherAssignments.colStatus"),
            cell: (row) => (
              <AdminTableStatusBadge
                variant={row.isActive ? "success" : "default"}
                label={row.isActive ? "Aktiv" : "Archiviert"}
              />
            ),
          },
          {
            id: "actions",
            header: "",
            align: "right",
            width: "3rem",
            cell: (row) => (
              <AdminTableActionsMenu
                actions={[
                  {
                    id: "edit",
                    label: t("adminGroups.edit", { defaultValue: "Bearbeiten" }),
                    onClick: () => openEdit(row),
                    icon: Pencil,
                  },
                  ...(row.isActive
                    ? [
                        {
                          id: "archive",
                          label: t("adminGroups.archive", { defaultValue: "Archivieren" }),
                          onClick: () => void archiveGroup(row.id),
                          variant: "danger" as const,
                          icon: Trash2,
                        },
                      ]
                    : []),
                ]}
              />
            ),
          },
        ]}
      />

      {editGroup && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border-default bg-surface-elevated p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-foreground">
                {t("adminGroups.editTitle", { defaultValue: "Gruppe bearbeiten" })} — {editGroup.name}
              </h2>
              <button
                type="button"
                onClick={() => setEditGroup(null)}
                className="rounded-lg p-1 text-text-muted hover:bg-surface-subtle"
                aria-label={t("common.close", { defaultValue: "Schließen" })}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => void handleSaveEdit(e)}>
              <GroupFormFields
                form={editForm}
                setForm={setEditForm}
                teachers={teachers}
                students={students}
                subjects={subjects}
                classes={classes}
                selectCls={selectCls}
                toggleStudent={makeToggle(setEditForm)}
                idPrefix="edit"
                t={t}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="submit" variant="gold" disabled={submitting} className="gap-2">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {t("adminGroups.save", { defaultValue: "Speichern" })}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditGroup(null)}>
                  {t("common.cancel", { defaultValue: "Abbrechen" })}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
