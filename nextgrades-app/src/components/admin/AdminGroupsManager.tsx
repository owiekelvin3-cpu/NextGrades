"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
  teacher: ProfileOption | null;
  subject: { id: string; name: string } | null;
  class: { id: string; name: string; level: number | null } | null;
  members: { studentId: string; name: string }[];
};

function displayName(p: ProfileOption | null): string {
  return p?.full_name?.trim() || p?.email || "—";
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
  const [form, setForm] = useState({
    name: "",
    teacherId: "",
    subjectId: "",
    classId: "",
    scheduleNotes: "",
    meetingUrl: "",
    studentIds: [] as string[],
  });

  const selectCls = (value: string) => themeSelectClass(value, "w-full");

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/groups");
      const data = (await res.json()) as { groups?: GroupRow[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setGroups(data.groups ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("adminGroups.fetchFailed", { defaultValue: "Gruppen konnten nicht geladen werden." }));
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

  const toggleStudent = (id: string) => {
    setForm((f) => ({
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
        body: JSON.stringify({
          name: form.name,
          teacherId: form.teacherId,
          subjectId: form.subjectId || null,
          classId: form.classId || null,
          scheduleNotes: form.scheduleNotes || null,
          meetingUrl: form.meetingUrl || null,
          studentIds: form.studentIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      toast.success(t("adminGroups.created", { defaultValue: "Gruppe erstellt." }));
      setForm({
        name: "",
        teacherId: "",
        subjectId: "",
        classId: "",
        scheduleNotes: "",
        meetingUrl: "",
        studentIds: [],
      });
      void fetchGroups();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("adminGroups.createFailed", { defaultValue: "Gruppe konnte nicht erstellt werden." }));
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
      toast.error(err instanceof Error ? err.message : t("adminGroups.updateFailed", { defaultValue: "Aktualisierung fehlgeschlagen." }));
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => void handleCreate(e)} className="rounded-2xl border border-border-default bg-surface-elevated p-5">
        <h2 className="mb-4 text-sm font-bold text-foreground">
          {t("adminGroups.createTitle", { defaultValue: "Neue Gruppe anlegen" })}
        </h2>
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
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-text-muted">
              {t("adminGroups.schedule", { defaultValue: "Zeitplan / Notizen" })}
            </label>
            <input
              value={form.scheduleNotes}
              onChange={(e) => setForm((f) => ({ ...f, scheduleNotes: e.target.value }))}
              className={themeInputClass}
              placeholder="z. B. Mittwoch 16:00"
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
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-border-default p-3">
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
                {row.members.length
                  ? row.members.map((m) => m.name).join(", ")
                  : "—"}
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
            cell: (row) =>
              row.isActive ? (
                <AdminTableActionsMenu
                  actions={[
                    {
                      id: "archive",
                      label: t("adminGroups.archive", { defaultValue: "Archivieren" }),
                      onClick: () => void archiveGroup(row.id),
                      variant: "danger",
                      icon: Trash2,
                    },
                  ]}
                />
              ) : null,
          },
        ]}
      />
    </div>
  );
}
