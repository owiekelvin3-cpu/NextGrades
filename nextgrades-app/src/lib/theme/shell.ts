/** Shared Tailwind classes that respond to `.dark` on `<html>`. */

import { hero } from "@/lib/premium/tokens";
import { theme as t } from "@/lib/theme/tokens";

export const appShell = {
  siteContainer: "site-container",
  marketingPage: "marketing-page-root min-h-screen bg-background text-foreground",
  marketingPageMuted: "marketing-page-root min-h-screen bg-surface-muted text-foreground",
  marketingHero: hero.inner,
  marketingMain: "site-main flex min-w-0 flex-1 flex-col overflow-x-hidden",
  responsiveGrid2: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6",
  responsiveGrid3: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6",
  responsiveGrid4: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:gap-6",
  sectionAlt: "bg-surface-muted",
  sectionSubtle: "bg-surface-subtle",
  dashboardShell: "admin-portal flex h-full min-h-0 max-h-[100dvh] overflow-hidden bg-surface-dashboard text-foreground",
  studentDashboardShell:
    "student-portal flex h-full min-h-0 max-h-[100dvh] overflow-hidden bg-surface-dashboard text-foreground",
  teacherDashboardShell:
    "admin-portal flex h-full min-h-0 max-h-[100dvh] overflow-hidden bg-surface-dashboard text-foreground",
  adminTopBar:
    "sticky top-0 z-20 hidden h-14 shrink-0 items-center gap-4 border-b border-border-default bg-surface-elevated px-4 sm:px-6 md:flex lg:px-8",
  adminMain:
    "admin-dashboard-main flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8",
  adminEyebrow:
    "inline-flex items-center gap-1.5 rounded-md border-l-[3px] border-[var(--brand-gold)] bg-[var(--brand-navy)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--brand-gold)]",
  adminPageTitle: "text-2xl font-bold tracking-tight text-foreground sm:text-3xl",
  adminPageDescription: "mt-1.5 max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base",
  dashboardHeader:
    "sticky top-0 z-30 border-b border-border-default/80 bg-surface-elevated/95 backdrop-blur-sm",
  dashboardTitle: "text-xl font-bold tracking-tight text-foreground sm:text-2xl",
  dashboardDescription: "mt-1 text-sm text-text-muted",
  dashboardProfileChip:
    "flex items-center gap-2 rounded-xl border border-border-default bg-surface-elevated py-1.5 pl-1.5 pr-2.5 text-sm text-foreground shadow-sm transition hover:border-[var(--border-strong)]",
  dashboardPanel: t.panel,
  elevatedCard: t.card,
} as const;
