"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Props = {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
};

export function CMSEmptyState({ title, description, icon: Icon, actionLabel, onAction }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-default bg-surface-elevated px-6 py-16 text-center">
      {Icon && <Icon className="mb-4 h-12 w-12 text-[var(--brand-gold)]" aria-hidden />}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-text-muted">{description}</p>
      {actionLabel && onAction && (
        <Button variant="gold" className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
