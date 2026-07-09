/** Shared marketing page surfaces - driven by CSS design tokens (no hardcoded theme branches). */

export const marketingTheme = {
  page: "bg-background text-foreground",
  section: "bg-surface-elevated",
  sectionAlt: "bg-surface-muted",
  card: "rounded-2xl border border-border-default bg-surface-elevated shadow-[var(--card-shadow)]",
  cardInner: "bg-surface-elevated",
  heading: "text-foreground",
  body: "text-foreground-secondary",
  muted: "text-text-muted",
  statsBox: "rounded-2xl border border-border-default bg-surface-subtle",
  tableWrap: "overflow-hidden rounded-xl border border-[var(--table-border)] bg-surface-elevated",
  tableHead: "bg-[var(--table-header)] text-text-muted",
  tableRowEven: "bg-surface-elevated",
  tableRowOdd: "bg-surface-muted/60",
} as const;

export { useMarketingTheme } from "@/lib/useMarketingTheme";
