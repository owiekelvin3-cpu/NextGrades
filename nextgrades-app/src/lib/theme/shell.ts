/** Shared Tailwind classes that respond to `.dark` on `<html>`. */

export const appShell = {
  marketingPage: "min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden",
  marketingPageMuted: "min-h-screen flex flex-col bg-surface-muted text-foreground overflow-x-hidden",
  marketingHero: "pt-site-nav",
  sectionAlt: "bg-surface-muted dark:bg-[#112240]",
  sectionSubtle: "bg-surface-subtle",
  dashboardShell:
    "flex h-full min-h-0 max-h-[100dvh] overflow-hidden bg-surface-dashboard text-foreground",
  dashboardHeader:
    "sticky top-0 z-30 border-b border-border-default/80 bg-surface-elevated/95 backdrop-blur-sm",
  dashboardTitle: "text-xl font-bold tracking-tight text-foreground sm:text-2xl",
  dashboardDescription: "mt-1 text-sm text-text-muted",
  dashboardProfileChip:
    "flex items-center gap-2 rounded-xl border border-border-default bg-surface-elevated py-1.5 pl-1.5 pr-2.5 text-sm text-foreground shadow-sm transition hover:border-gray-300 dark:hover:border-white/20",
  dashboardPanel:
    "rounded-2xl border border-border-default bg-surface-elevated shadow-sm",
  elevatedCard:
    "rounded-2xl border border-border-default bg-surface-elevated shadow-sm",
} as const;
