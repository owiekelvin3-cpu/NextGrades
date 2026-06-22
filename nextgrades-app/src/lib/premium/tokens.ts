/** Premium EdTech design tokens — shared across marketing surfaces */

export const premium = {
  navy: "#0D1B2A",
  navyMuted: "#112240",
  navyDeep: "#0A1520",
  gold: "#D4AF37",
  goldHover: "#C9A030",
  cream: "#FAF8F5",
  surface: "#F7F8FA",
  border: "rgba(13, 27, 42, 0.08)",
  borderDark: "rgba(255, 255, 255, 0.1)",
} as const;

export const section = {
  /** Standard vertical rhythm — scales by viewport */
  py: "py-12 sm:py-16 md:py-20 lg:py-28 xl:py-32",
  pyCompact: "py-10 sm:py-14 md:py-16 lg:py-20",
  container:
    "site-container mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6 md:px-8 lg:px-8 xl:px-10 2xl:px-12",
} as const;

/** Homepage hero spacing — shared across all marketing page heroes */
export const hero = {
  section:
    "relative min-h-[min(100dvh,52rem)] overflow-hidden sm:min-h-[520px] md:min-h-[560px] lg:min-h-[640px] xl:min-h-[680px]",
  inner:
    "relative z-10 mx-auto flex w-full min-w-0 max-w-7xl flex-col justify-center px-4 pb-12 pt-site-nav sm:px-6 sm:pb-16 md:px-8 md:pb-20 md:pt-28 lg:pb-20 lg:px-8 xl:px-10 2xl:px-12",
  innerCentered:
    "relative z-10 mx-auto flex w-full min-w-0 max-w-3xl flex-col items-center justify-center px-4 pb-12 pt-site-nav text-center sm:px-6 sm:pb-16 md:px-8 md:pb-20 md:pt-28 lg:px-8 xl:px-10 2xl:px-12",
} as const;

export const card = {
  base: "rounded-3xl border border-border-default bg-surface-elevated shadow-[var(--card-shadow)] transition-shadow duration-300 hover:shadow-[0_8px_48px_rgba(13,27,42,0.1)]",
  baseDark: "rounded-3xl border border-border-default bg-surface-elevated shadow-[var(--card-shadow)]",
  featured:
    "rounded-3xl border-2 border-[var(--brand-gold)]/40 bg-surface-elevated shadow-[0_12px_48px_rgba(212,175,55,0.12)]",
} as const;

export const type = {
  eyebrow: "text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]",
  h1: "text-[clamp(1.75rem,4vw+0.5rem,3.5rem)] font-bold leading-[1.08] tracking-tight",
  h2: "text-[clamp(1.375rem,2.5vw+0.5rem,2.75rem)] font-bold leading-tight tracking-tight",
  h3: "text-xl font-bold leading-snug sm:text-2xl",
  body: "text-base leading-relaxed text-foreground-secondary sm:text-lg",
  bodyDark: "text-base leading-relaxed text-on-navy-muted sm:text-lg",
  bodyDarkMuted: "text-sm text-on-navy-subtle",
} as const;
