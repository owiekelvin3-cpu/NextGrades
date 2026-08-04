"use client";

import { cn } from "@/lib/utils";
import type { LearningResource } from "@/components/resources/ResourceLearningCard";
import { isPremiumResource } from "@/lib/resources/ui-config";
import {
  LibraryCardBody,
  LibraryCardThumbnail,
} from "@/components/resources/shared/LibraryResourceCardParts";

type Props = {
  resource: LearningResource;
  onOpen?: () => void;
  variant?: "free" | "premium";
  subjectSlug?: string;
};

export function MobileResourceCard({ resource, onOpen, variant, subjectSlug }: Props) {
  const locked =
    resource.locked ??
    ((variant === "premium" || isPremiumResource(resource)) && resource.canAccess === false);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface-elevated)] shadow-sm transition duration-300",
        "active:scale-[0.99]"
      )}
    >
      <LibraryCardThumbnail resource={resource} subjectSlug={subjectSlug} locked={locked} />
      <LibraryCardBody
        resource={resource}
        subjectSlug={subjectSlug}
        onOpen={onOpen ?? (() => {})}
        compact
      />
    </article>
  );
}
