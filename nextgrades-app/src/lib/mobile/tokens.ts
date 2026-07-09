/** Mobile-first design tokens - Pathora-inspired spacing & rhythm, NextGrades colors. */

export const mobile = {
  /** Generous edge padding (20px) */
  pageX: "px-5 md:px-6 lg:px-8",
  /** Vertical section spacing */
  sectionY: "py-8 md:py-10",
  /** Gap between stacked sections */
  sectionGap: "space-y-8 md:space-y-10",
  /** Card internal padding */
  cardPad: "p-5 md:p-6",
  /** Gap between cards */
  cardGap: "gap-4 md:gap-5",
  /** Minimum 48×48 touch target */
  touchTarget: "min-h-12 min-w-12 touch-manipulation",
  /** Primary CTA - full-width pill style */
  button:
    "min-h-[52px] px-6 text-base font-semibold rounded-2xl touch-manipulation active:scale-[0.98] transition-transform",
  /** Outline / secondary button */
  buttonOutline:
    "min-h-[52px] px-6 text-base font-semibold rounded-2xl border-2 border-border-default bg-transparent touch-manipulation active:scale-[0.98]",
  /** Soft card - large radius like reference UI */
  card:
    "rounded-3xl border border-border-default/80 bg-surface-elevated shadow-[0_2px_24px_rgba(13,27,42,0.06)] overflow-hidden dark:shadow-[0_2px_24px_rgba(0,0,0,0.25)]",
  /** Tappable card */
  cardInteractive:
    "rounded-3xl border border-border-default/80 bg-surface-elevated shadow-[0_2px_24px_rgba(13,27,42,0.06)] overflow-hidden transition-transform duration-150 active:scale-[0.98] touch-manipulation",
  /** Hero page title */
  pageTitle: "text-[1.75rem] font-bold tracking-tight text-foreground leading-[1.15] sm:text-3xl",
  /** Section heading */
  sectionTitle: "text-lg font-bold text-foreground tracking-tight",
  /** Body */
  body: "text-[15px] leading-[1.65] text-foreground",
  /** Muted caption */
  caption: "text-[15px] leading-relaxed text-text-muted",
  /** Small pill badge */
  pill: "inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/12 px-3.5 py-1.5 text-xs font-semibold text-[#D4AF37]",
  /** Menu drawer row */
  menuItem:
    "flex min-h-[52px] items-center gap-4 rounded-2xl px-4 transition-colors active:bg-surface-subtle",
  /** Horizontal chip row */
  chipRow: "flex gap-2.5 overflow-x-auto pb-1 scrollbar-none -mx-5 px-5 md:mx-0 md:px-0",
  /** Filter chip */
  chip: "shrink-0 rounded-full px-4 py-2.5 text-sm font-medium touch-manipulation min-h-10",
  /** Swipeable stats row */
  swipeRow:
    "flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-none -mx-5 px-5 md:mx-0 md:px-0 md:grid md:overflow-visible md:snap-none",
  swipeCard: "snap-start shrink-0 w-[82vw] max-w-[300px] md:w-auto md:max-w-none md:shrink md:flex-1",
  /** Bottom nav clearance */
  bottomPad: "pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0",
  topSafe: "pt-[max(0.75rem,env(safe-area-inset-top))]",
  stickyAction:
    "fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 border-t border-border-default/60 bg-surface-elevated/95 px-5 py-4 backdrop-blur-md md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none",
} as const;

export const MOBILE_BOTTOM_NAV_HEIGHT = "5rem";

export const MOBILE_BOTTOM_NAV_PADDING =
  "pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0";
