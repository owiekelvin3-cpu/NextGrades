"use client";

import { useEffect, useState } from "react";
import { Clock, User } from "lucide-react";
import type { CmsActivityEntry } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

type Props = {
  pageName?: string;
  isDark: boolean;
};

export function CmsActivityPanel({ pageName, isDark }: Props) {
  const [entries, setEntries] = useState<CmsActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ limit: "20" });
    if (pageName) params.set("page", pageName);
    void fetch(`/api/cms/activity?${params}`)
      .then((r) => r.json())
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [pageName]);

  const textMuted = isDark ? "text-gray-400" : "text-gray-600";

  return (
    <div className="space-y-3">
      <p className={cn("text-xs font-semibold uppercase tracking-wider", textMuted)}>Activity log</p>
      {loading ? (
        <p className={cn("text-sm", textMuted)}>Loading…</p>
      ) : entries.length === 0 ? (
        <p className={cn("text-sm", textMuted)}>No activity yet.</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => (
            <li
              key={e.id}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-sm",
                isDark ? "border-white/10 bg-[#112240]/50" : "border-gray-100 bg-gray-50"
              )}
            >
              <p className={isDark ? "text-white" : "text-[#0D1B2A]"}>{e.summary}</p>
              <div className={cn("mt-1 flex flex-wrap items-center gap-3 text-[11px]", textMuted)}>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(e.created_at).toLocaleString()}
                </span>
                {e.user_email && (
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {e.user_email}
                  </span>
                )}
                <span className="rounded bg-[#D4AF37]/15 px-1.5 py-0.5 text-[#D4AF37]">{e.action}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
