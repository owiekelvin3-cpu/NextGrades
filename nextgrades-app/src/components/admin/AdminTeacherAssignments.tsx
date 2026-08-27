"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
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

type AssignmentRow = {
  id: string;
  teacher_id: string;
  student_id: string;
  subject_id: string | null;
  class_id: string | null;
  status: "active" | "paused" | "ended";
  notes: string | null;
  created_at: string;
  teacher: ProfileOption | null;
  student: ProfileOption | null;
  subject: { id: string; name: string } | null;
  class: { id: string; name: string; level: number | null } | null;
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "default"> = {
  active: "success",
  paused: "warning",
  ended: "default",
};

function displayName(p: ProfileOption | null): string {
  return p?.full_name?.trim() || p?.email || "—";
}

export function AdminTeacherAssignments() {
  const { t } = useTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [teachers, setTeachers] = useState<ProfileOption[]>([]);
  const [students, setStudents] = useState<ProfileOption[]>([]);
  const [subjects, setSubjects] = useState<CatalogSubject[]>([]);
  const [classes, setClasses] = useState<CatalogClass[]>([]);
  const [form, setForm] = useState({
    teacherId: "",
    studentId: "",
    subjectId: "",
    classId: "",
    notes: "",
  });

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/teacher-assignments");
      const data = (await res.json()) as { assignments?: AssignmentRow[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setAssignments(data.assignments ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("adminTeacherAssignments.fetchFailed"));
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
    void fetchAssignments();
    void fetchOptions();
  }, [fetchAssignments, fetchOptions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.teacherId || !form.studentId) {
      toast.error(t("adminTeacherAssignments.requiredFields"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/teacher-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: form.teacherId,
          studentId: form.studentId,
          subjectId: form.subjectId || null,
          classId: form.classId || null,
          notes: form.notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      toast.success(t("adminTeacherAssignments.created"));
      setForm({ teacherId: "", studentId: "", subjectId: "", classId: "", notes: "" });
      void fetchAssignments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("adminTeacherAssignments.createFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const patchAssignment = async (id: string, patch: { status?: string; notes?: string | null }) => {
    try {
      const res = await fetch(`/api/admin/teacher-assignments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      toast.success(t("adminTeacherAssignments.updated"));
      void fetchAssignments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("adminTeacherAssignments.updateFailed"));
    }
  };

  const endAssignment = async (id: string) => {
    if (!confirm(t("adminTeacherAssignments.confirmEnd"))) return;
    try {
      const res = await fetch(`/api/admin/teacher-assignments/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to end");
      toast.success(t("adminTeacherAssignments.ended"));
      void fetchAssignments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("adminTeacherAssignments.endFailed"));
    }
  };

  const selectCls = (value: string) => themeSelectClass(value, "rounded-lg py-2.5");

  const statusLabel = useMemo(
    () =>
      ({
        active: t("adminTeacherAssignments.statusActive"),
        paused: t("adminTeacherAssignments.statusPaused"),
        ended: t("adminTeacherAssignments.statusEnded"),
      }) as Record<string, string>,
    [t]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => void fetchAssignments()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t("adminTeacherAssignments.refresh")}
        </Button>
      </div>

      <form
        onSubmit={(e) => void handleCreate(e)}
        className="admin-panel space-y-4 rounded-2xl border border-border-default bg-surface-elevated p-5 sm:p-6"
      >
        <h2 className="text-sm font-semibold text-foreground">{t("adminTeacherAssignments.newAssignment")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">
              {t("adminTeacherAssignments.teacher")}
            </label>
            <select
              required
              value={form.teacherId}
              onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}
              className={selectCls(form.teacherId)}
            >
              <option value="">{t("adminTeacherAssignments.selectTeacher")}</option>
              {teachers.map((p) => (
                <option key={p.id} value={p.id}>
                  {displayName(p)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">
              {t("adminTeacherAssignments.student")}
            </label>
            <select
              required
              value={form.studentId}
              onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
              className={selectCls(form.studentId)}
            >
              <option value="">{t("adminTeacherAssignments.selectStudent")}</option>
              {students.map((p) => (
                <option key={p.id} value={p.id}>
                  {displayName(p)}
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
              {t("adminTeacherAssignments.notes")}
            </label>
            <input
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder={t("adminTeacherAssignments.notesPlaceholder")}
              className={themeInputClass}
            />
          </div>
        </div>
        <Button type="submit" variant="gold" disabled={submitting} className="gap-2">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {t("adminTeacherAssignments.assign")}
        </Button>
      </form>

      <AdminTable<AssignmentRow>
        title={t("adminTeacherAssignments.listTitle")}
        loading={loading}
        data={assignments}
        getRowId={(row) => row.id}
        emptyState={{
          title: t("adminTeacherAssignments.empty"),
        }}
        columns={[
          {
            id: "teacher",
            header: t("adminTeacherAssignments.colTeacher"),
            cell: (row) => (
              <span className="text-sm font-medium text-foreground">{displayName(row.teacher)}</span>
            ),
          },
          {
            id: "student",
            header: t("adminTeacherAssignments.colStudent"),
            cell: (row) => <span className="text-sm text-text-muted">{displayName(row.student)}</span>,
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
            id: "status",
            header: t("adminTeacherAssignments.colStatus"),
            cell: (row) => (
              <AdminTableStatusBadge
                variant={STATUS_VARIANT[row.status] ?? "default"}
                label={statusLabel[row.status] ?? row.status}
              />
            ),
          },
          {
            id: "created",
            header: t("adminTeacherAssignments.colCreated"),
            cell: (row) => (
              <span className="text-sm text-text-muted">
                {new Date(row.created_at).toLocaleDateString("de-AT")}
              </span>
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
                  ...(row.status === "active"
                    ? [
                        {
                          id: "pause",
                          label: t("adminTeacherAssignments.pause"),
                          onClick: () => void patchAssignment(row.id, { status: "paused" }),
                        },
                      ]
                    : []),
                  ...(row.status === "paused"
                    ? [
                        {
                          id: "reactivate",
                          label: t("adminTeacherAssignments.reactivate"),
                          onClick: () => void patchAssignment(row.id, { status: "active" }),
                        },
                      ]
                    : []),
                  ...(row.status !== "ended"
                    ? [
                        {
                          id: "end",
                          label: t("adminTeacherAssignments.end"),
                          onClick: () => void endAssignment(row.id),
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
    </div>
  );
}
