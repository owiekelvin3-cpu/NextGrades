"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useToast } from "@/context/ToastContext";
import { useTranslation } from "react-i18next";
import { themeInputClass } from "@/lib/theme/form-fields";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, RefreshCw, Search, KeyRound, X } from "lucide-react";

type Student = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
};

type MaterialRef = {
  id: string;
  title: string;
  content_type?: string | null;
  type?: string | null;
  access_type?: string | null;
  is_premium?: boolean | null;
  file_name?: string | null;
  mime_type?: string | null;
  subject?: { id: string; name: string } | { id: string; name: string }[] | null;
  class?: { id: string; name: string; level?: number } | { id: string; name: string; level?: number }[] | null;
};

type GrantRow = {
  id: string;
  material_id: string;
  granted_at: string;
  expires_at: string | null;
  status: string;
  material: MaterialRef | MaterialRef[] | null;
};

function asOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function materialTypeLabel(material: MaterialRef | null): string {
  if (!material) return "—";
  const mime = (material.mime_type || "").toLowerCase();
  if (mime.startsWith("video/") || (material.content_type || "").includes("video") || material.type === "video") {
    return "Video";
  }
  if (mime.includes("pdf") || (material.file_name || "").toLowerCase().endsWith(".pdf")) return "PDF";
  return (material.content_type || material.type || "Material").replaceAll("_", " ");
}

function materialTitle(material: MaterialRef | null): string {
  return material?.title?.trim() || "Ohne Titel";
}

function subjectName(material: MaterialRef | null): string {
  return asOne(material?.subject)?.name || "—";
}

export function AdminResourceUnlockPanel() {
  const { t } = useTranslation();
  const toast = useToast();

  const [studentQuery, setStudentQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selected, setSelected] = useState<Student | null>(null);

  const [grants, setGrants] = useState<GrantRow[]>([]);
  const [grantsLoading, setGrantsLoading] = useState(false);

  const [resourceQuery, setResourceQuery] = useState("");
  const [materials, setMaterials] = useState<MaterialRef[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const grantedIds = useMemo(() => new Set(grants.map((g) => g.material_id)), [grants]);

  const loadStudents = useCallback(async (q: string) => {
    setStudentsLoading(true);
    try {
      const params = new URLSearchParams({
        role: "student",
        limit: "30",
        search: q,
        sort: "full_name",
      });
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load students");
      setStudents((data.users ?? []) as Student[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("adminResourceUnlock.loadError"));
    } finally {
      setStudentsLoading(false);
    }
  }, [t, toast]);

  const loadGrants = useCallback(async (studentId: string) => {
    setGrantsLoading(true);
    try {
      const res = await fetch(`/api/admin/resource-grants?studentId=${encodeURIComponent(studentId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load unlocks");
      setGrants((data.grants ?? []) as GrantRow[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("adminResourceUnlock.loadError"));
    } finally {
      setGrantsLoading(false);
    }
  }, [t, toast]);

  const loadMaterials = useCallback(async (q: string) => {
    setMaterialsLoading(true);
    try {
      const params = new URLSearchParams({ catalog: "1", search: q });
      const res = await fetch(`/api/admin/resource-grants?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load resources");
      setMaterials((data.materials ?? []) as MaterialRef[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("adminResourceUnlock.loadError"));
    } finally {
      setMaterialsLoading(false);
    }
  }, [t, toast]);

  useEffect(() => {
    const timer = setTimeout(() => void loadStudents(studentQuery), 250);
    return () => clearTimeout(timer);
  }, [studentQuery, loadStudents]);

  useEffect(() => {
    const timer = setTimeout(() => void loadMaterials(resourceQuery), 250);
    return () => clearTimeout(timer);
  }, [resourceQuery, loadMaterials]);

  useEffect(() => {
    if (selected) void loadGrants(selected.id);
    else setGrants([]);
  }, [selected, loadGrants]);

  const unlock = async (materialId: string) => {
    if (!selected) return;
    setUnlockingId(materialId);
    try {
      const res = await fetch("/api/admin/resource-grants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selected.id, materialId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unlock failed");
      toast.success(t("adminResourceUnlock.unlocked"));
      await loadGrants(selected.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("adminResourceUnlock.unlockError"));
    } finally {
      setUnlockingId(null);
    }
  };

  const revoke = async (grantId: string) => {
    setRevokingId(grantId);
    try {
      const res = await fetch(`/api/admin/resource-grants?id=${encodeURIComponent(grantId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Revoke failed");
      toast.success(t("adminResourceUnlock.revoked"));
      if (selected) await loadGrants(selected.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("adminResourceUnlock.revokeError"));
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title={t("adminResourceUnlock.title")}
        description={t("adminResourceUnlock.description")}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <Card className="p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-muted">
            {t("adminResourceUnlock.pickStudent")}
          </h2>
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={studentQuery}
              onChange={(e) => setStudentQuery(e.target.value)}
              placeholder={t("adminResourceUnlock.studentSearch")}
              className={cn(themeInputClass, "rounded-lg py-2.5 pl-10")}
            />
          </div>
          {studentsLoading ? (
            <p className="py-6 text-center text-sm text-text-muted">{t("adminResourceUnlock.loading")}</p>
          ) : students.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">{t("adminResourceUnlock.noStudents")}</p>
          ) : (
            <ul className="max-h-[28rem] space-y-1 overflow-y-auto">
              {students.map((student) => {
                const active = selected?.id === student.id;
                return (
                  <li key={student.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(student)}
                      className={cn(
                        "w-full rounded-xl px-3 py-2.5 text-left transition",
                        active
                          ? "bg-[#D4AF37]/15 ring-1 ring-[#D4AF37]/40"
                          : "hover:bg-surface-muted"
                      )}
                    >
                      <p className="truncate text-sm font-semibold text-foreground">
                        {student.full_name || student.email || student.id}
                      </p>
                      <p className="truncate text-xs text-text-muted">{student.email}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          {!selected ? (
            <Card className="p-8 text-center text-sm text-text-muted">
              {t("adminResourceUnlock.selectHint")}
            </Card>
          ) : (
            <>
              <Card className="p-4 sm:p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      {selected.full_name || selected.email}
                    </h2>
                    <p className="text-sm text-text-muted">{selected.email}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void loadGrants(selected.id)}
                    disabled={grantsLoading}
                  >
                    <RefreshCw className={cn("h-4 w-4", grantsLoading && "animate-spin")} />
                  </Button>
                </div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-muted">
                  {t("adminResourceUnlock.currentUnlocks")}
                </h3>
                {grantsLoading ? (
                  <p className="py-4 text-sm text-text-muted">{t("adminResourceUnlock.loading")}</p>
                ) : grants.length === 0 ? (
                  <p className="py-4 text-sm text-text-muted">{t("adminResourceUnlock.noGrants")}</p>
                ) : (
                  <ul className="divide-y divide-border-default">
                    {grants.map((grant) => {
                      const material = asOne(grant.material);
                      return (
                        <li key={grant.id} className="flex items-center justify-between gap-3 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {materialTitle(material)}
                            </p>
                            <p className="truncate text-xs text-text-muted">
                              {materialTypeLabel(material)} · {subjectName(material)}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={revokingId === grant.id}
                            onClick={() => void revoke(grant.id)}
                          >
                            {revokingId === grant.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                            {t("adminResourceUnlock.revoke")}
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>

              <Card className="p-4 sm:p-5">
                <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-text-muted">
                  {t("adminResourceUnlock.unlockAny")}
                </h3>
                <p className="mb-3 text-sm text-text-muted">{t("adminResourceUnlock.unlockAnyHint")}</p>
                <div className="relative mb-3">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input
                    value={resourceQuery}
                    onChange={(e) => setResourceQuery(e.target.value)}
                    placeholder={t("adminResourceUnlock.resourceSearch")}
                    className={cn(themeInputClass, "rounded-lg py-2.5 pl-10")}
                  />
                </div>
                {materialsLoading ? (
                  <p className="py-4 text-sm text-text-muted">{t("adminResourceUnlock.loading")}</p>
                ) : materials.length === 0 ? (
                  <p className="py-4 text-sm text-text-muted">{t("adminResourceUnlock.noResources")}</p>
                ) : (
                  <ul className="max-h-[28rem] divide-y divide-border-default overflow-y-auto">
                    {materials.map((material) => {
                      const already = grantedIds.has(material.id);
                      return (
                        <li key={material.id} className="flex items-center justify-between gap-3 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{materialTitle(material)}</p>
                            <p className="truncate text-xs text-text-muted">
                              {materialTypeLabel(material)} · {subjectName(material)}
                            </p>
                          </div>
                          <Button
                            variant={already ? "outline" : "gold"}
                            size="sm"
                            disabled={already || unlockingId === material.id}
                            onClick={() => void unlock(material.id)}
                          >
                            {unlockingId === material.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : already ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <KeyRound className="h-4 w-4" />
                            )}
                            {already
                              ? t("adminResourceUnlock.alreadyUnlocked")
                              : t("adminResourceUnlock.unlock")}
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
