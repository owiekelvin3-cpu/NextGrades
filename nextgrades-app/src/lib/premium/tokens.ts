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
  /** Standard vertical rhythm */
  py: "py-20 md:py-28 lg:py-32",
  pyCompact: "py-16 md:py-20",
  container: "mx-auto w-full min-w-0 max-w-7xl px-5 sm:px-6 lg:px-8",
} as const;

/** Homepage hero spacing — shared across all marketing page heroes */
export const hero = {
  section: "relative min-h-[520px] overflow-hidden md:min-h-[600px] lg:min-h-[680px]",
  inner:
    "relative z-10 mx-auto flex w-full min-w-0 max-w-7xl flex-col justify-center px-5 pb-16 pt-site-nav sm:px-6 md:min-h-[600px] md:pb-20 md:pt-28 lg:min-h-[680px] lg:px-8 min-h-[520px]",
  innerCentered:
    "relative z-10 mx-auto flex w-full min-w-0 max-w-3xl flex-col items-center justify-center px-5 pb-16 pt-site-nav text-center sm:px-6 md:min-h-[600px] md:pb-20 md:pt-28 lg:min-h-[680px] lg:px-8 min-h-[520px]",
} as const;

export const card = {
  base: "rounded-3xl border bg-white shadow-[0_2px_40px_rgba(13,27,42,0.06)] transition-shadow duration-300 hover:shadow-[0_8px_48px_rgba(13,27,42,0.1)]",
  baseDark: "rounded-3xl border border-border-default bg-surface-elevated shadow-[var(--card-shadow)]",
  featured: "rounded-3xl border-2 border-[#D4AF37]/40 bg-white shadow-[0_12px_48px_rgba(212,175,55,0.12)]",
} as const;

export const type = {
  eyebrow: "text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]",
  h1: "text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]",
  h2: "text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]",
  h3: "text-xl font-bold leading-snug sm:text-2xl",
  body: "text-base leading-relaxed text-gray-600 sm:text-lg",
  bodyDark: "text-base leading-relaxed text-gray-300 sm:text-lg",
} as const;
