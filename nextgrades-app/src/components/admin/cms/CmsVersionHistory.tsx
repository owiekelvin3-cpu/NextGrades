"use client";

import { useEffect, useState } from "react";
import { History, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import type { CmsRevision } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

type Props = {
  i18nKey?: string;
  isDark: boolean;
  onRollback?: () => void;
};

export function CmsVersionHistory({ i18nKey, isDark, onRollback }: Props) {
  const toast = useToast();
  const [revisions, setRevisions] = useState<CmsRevision[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "15" });
      if (i18nKey) params.set("i18n_key", i18nKey);
      const res = await fetch(`/api/cms/revisions?${params}`);
      setRevisions(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [i18nKey]);

  const rollback = async (revisionId: string) => {
    if (!confirm("Restore this version to the live site?")) return;
    const res = await fetch("/api/cms/revisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revisionId }),
    });
    if (!res.ok) {
      toast.error("Rollback failed");
      return;
    }
    toast.success("Version restored");
    onRollback?.();
    void load();
  };

  const textMuted = isDark ? "text-gray-400" : "text-gray-600";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-[#D4AF37]" />
        <p className={cn("text-xs font-semibold uppercase tracking-wider", textMuted)}>Version history</p>
      </div>
      {loading ? (
        <p className={cn("text-sm", textMuted)}>Loading…</p>
      ) : revisions.length === 0 ? (
        <p className={cn("text-sm", textMuted)}>No saved versions yet. Versions are created when you publish.</p>
      ) : (
        <ul className="max-h-64 space-y-2 overflow-y-auto">
          {revisions.map((r) => (
            <li
              key={r.id}
              className={cn(
                "flex items-center justify-between gap-2 rounded-xl border px-3 py-2",
                isDark ? "border-white/10 bg-[#112240]/50" : "border-gray-100 bg-gray-50"
              )}
            >
              <div className="min-w-0">
                <p className={cn("truncate text-sm font-medium", "text-foreground")}>
                  {r.i18n_key}
                </p>
                <p className={cn("text-[11px]", textMuted)}>{new Date(r.created_at).toLocaleString()}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => void rollback(r.id)}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
