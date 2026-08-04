import type { LearningResource } from "@/components/resources/ResourceLearningCard";
import { contentTypeLabel } from "@/lib/resources/constants";
import { isVideoResource } from "@/lib/resources/video";
import { isPremiumResource } from "@/lib/resources/ui-config";

type CatalogLabels = {
  semester?: (sem: number) => string;
  summaryFallback?: string;
  metaFallback?: string;
};

/** Subject · grade · semester line for library cards. */
export function formatResourceCatalogLine(
  resource: LearningResource,
  labels?: CatalogLabels
): string {
  const parts: string[] = [];
  if (resource.subject?.name) parts.push(resource.subject.name);
  if (resource.class?.name) parts.push(resource.class.name);
  if (resource.semester === 1 || resource.semester === 2) {
    parts.push(
      labels?.semester?.(resource.semester) ??
        `${resource.semester}. Semester`
    );
  }
  if (parts.length) return parts.join(" · ");
  return labels?.metaFallback ?? "NextGrades Library";
}

/** Card summary — never returns empty string. */
export function formatResourceSummary(
  resource: LearningResource,
  labels?: Pick<CatalogLabels, "summaryFallback">
): string {
  const text =
    resource.short_description?.trim() ||
    resource.description?.trim() ||
    resource.full_description?.trim();
  if (text) return text;

  const subject = resource.subject?.name;
  const grade = resource.class?.name;
  if (subject && grade) {
    return `Structured learning material for ${subject}, ${grade}.`;
  }
  if (subject) {
    return `Curated learning material for ${subject}.`;
  }

  return labels?.summaryFallback ?? "Curated learning material from the NextGrades library.";
}

/** Compact type badge label for thumbnails. */
export function formatResourceTypeBadge(resource: LearningResource): string {
  if (isVideoResource(resource)) return "Video";
  const label = contentTypeLabel(resource.content_type || resource.type || "resource");
  if (label.length <= 18) return label;
  return label.split(" ")[0] ?? label;
}

export function resourceIsPremium(resource: LearningResource): boolean {
  return isPremiumResource(resource);
}

export function resourceIsLocked(resource: LearningResource): boolean {
  const premium = resourceIsPremium(resource);
  return resource.locked ?? (premium && resource.canAccess === false);
}

/** Build short description on publish when author leaves it blank. */
export function buildAutoShortDescription(input: {
  title: string;
  subjectName?: string | null;
  className?: string | null;
  semester?: number | null;
}): string {
  const parts = [input.title.trim()];
  if (input.subjectName) parts.push(input.subjectName);
  if (input.className) parts.push(input.className);
  if (input.semester === 1 || input.semester === 2) {
    parts.push(`${input.semester}. Semester`);
  }
  return parts.filter(Boolean).join(" · ").slice(0, 200);
}
