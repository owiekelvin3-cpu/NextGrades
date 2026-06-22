"use client";

import { ChevronDown, ChevronUp, Eye, EyeOff, GripVertical } from "lucide-react";
import type { CmsFieldGroup } from "@/lib/cms/field-groups";
import { cn } from "@/lib/utils";

export type SectionLayout = {
  section_key: string;
  sort_order: number;
  is_visible: boolean;
};

type Props = {
  groups: CmsFieldGroup[];
  layout: SectionLayout[];
  onChange: (layout: SectionLayout[]) => void;
  isDark: boolean;
};

export function CmsSectionBuilder({ groups, layout, onChange, isDark }: Props) {
  const ordered = [...groups].sort((a, b) => {
    const la = layout.find((l) => l.section_key === a.id);
    const lb = layout.find((l) => l.section_key === b.id);
    return (la?.sort_order ?? 999) - (lb?.sort_order ?? 999);
  });

  const getLayout = (id: string): SectionLayout => {
    return (
      layout.find((l) => l.section_key === id) ?? {
        section_key: id,
        sort_order: 999,
        is_visible: true,
      }
    );
  };

  const update = (id: string, patch: Partial<SectionLayout>) => {
    const next = [...layout];
    const idx = next.findIndex((l) => l.section_key === id);
    const base = getLayout(id);
    if (idx >= 0) next[idx] = { ...next[idx], ...patch };
    else next.push({ ...base, ...patch });
    onChange(next);
  };

  const move = (id: string, dir: -1 | 1) => {
    const ids = ordered.map((g) => g.id);
    const index = ids.indexOf(id);
    const swap = index + dir;
    if (swap < 0 || swap >= ids.length) return;
    const reordered = [...ids];
    [reordered[index], reordered[swap]] = [reordered[swap], reordered[index]];
    onChange(
      reordered.map((key, sort_order) => ({
        ...getLayout(key),
        section_key: key,
        sort_order,
      }))
    );
  };

  const textMuted = isDark ? "text-gray-400" : "text-gray-600";

  return (
    <div className="space-y-2">
      <p className={cn("text-xs font-semibold uppercase tracking-wider", textMuted)}>Page sections</p>
      {ordered.map((group) => {
        const cfg = getLayout(group.id);
        return (
          <div
            key={group.id}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3 py-2",
              isDark ? "border-white/10 bg-[#112240]/60" : "border-gray-200 bg-white",
              !cfg.is_visible && "opacity-50"
            )}
          >
            <GripVertical className="h-4 w-4 shrink-0 text-gray-400" />
            <div className="min-w-0 flex-1">
              <p className={cn("truncate text-sm font-medium", "text-foreground")}>
                {group.label}
              </p>
              <p className={cn("text-[11px]", textMuted)}>{group.fieldKeys.length} fields</p>
            </div>
            <button
              type="button"
              title={cfg.is_visible ? "Hide section" : "Show section"}
              onClick={() => update(group.id, { is_visible: !cfg.is_visible })}
              className="rounded-lg p-1.5 text-gray-400 hover:text-[#D4AF37]"
            >
              {cfg.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            <button type="button" onClick={() => move(group.id, -1)} className="rounded-lg p-1 text-gray-400 hover:text-white">
              <ChevronUp className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => move(group.id, 1)} className="rounded-lg p-1 text-gray-400 hover:text-white">
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
