"use client";

import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-border-default bg-surface-subtle px-6 py-12 text-center">
      <Inbox className="mx-auto mb-4 h-12 w-12 text-text-muted" />
      <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mx-auto mb-4 max-w-md text-sm text-text-muted">{description}</p>
      )}
      {action}
    </div>
  );
}
