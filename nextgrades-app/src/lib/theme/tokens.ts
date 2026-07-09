/**
 * Semantic theme class bundles - always prefer these over hardcoded hex + dark: pairs.
 * All colors resolve via CSS variables in design-tokens.css.
 */

export const theme = {
  /** Page shells */
  page: "bg-background text-foreground",
  pageMuted: "bg-surface-muted text-foreground",
  dashboard: "bg-surface-dashboard text-foreground",

  /** Typography */
  textPrimary: "text-foreground",
  textSecondary: "text-foreground-secondary",
  textMuted: "text-text-muted",
  textSubtle: "text-text-muted/80",

  /** Surfaces */
  surface: "bg-surface-elevated",
  surfaceMuted: "bg-surface-muted",
  surfaceSubtle: "bg-surface-subtle",
  surfaceInset: "bg-[var(--surface-inset)]",

  /** Borders */
  border: "border-border-default",
  borderStrong: "border-[var(--border-strong)]",
  borderSubtle: "border-[var(--border-subtle)]",

  /** Cards & panels */
  card: "rounded-2xl border border-border-default bg-surface-elevated shadow-sm",
  panel: "rounded-2xl border border-border-default bg-surface-elevated shadow-[var(--card-shadow)]",
  panelHeader: "border-b border-border-default px-5 py-3.5",

  /** Navigation */
  navBar: "theme-nav-bar",
  navLink: "theme-nav-link",
  navDropdown: "bg-[var(--nav-dropdown)] border border-border-default shadow-lg",

  /** Forms */
  input: "theme-input px-4 py-3 text-sm",
  inputLegacy:
    "w-full rounded-xl border border-input-border bg-input-background px-4 py-3 text-input-foreground placeholder:text-input-placeholder focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)]",

  /** Tables */
  tableWrap: "theme-table-wrap",
  tableHead: "theme-table-head text-xs font-semibold uppercase tracking-wide",
  tableRow: "border-b border-[var(--table-border)] transition-colors hover:bg-[var(--table-row-hover)]",

  /** Modals */
  modalOverlay: "theme-modal-overlay",
  modalPanel: "theme-modal-panel rounded-2xl",

  /** Alerts */
  alertSuccess: "theme-alert-success rounded-xl px-4 py-3 text-sm",
  alertWarning: "theme-alert-warning rounded-xl px-4 py-3 text-sm",
  alertError: "theme-alert-error rounded-xl px-4 py-3 text-sm",
  alertInfo: "theme-alert-info rounded-xl px-4 py-3 text-sm",

  /** Text on fixed navy marketing bands */
  onNavyMuted: "text-on-navy-muted",
  onNavySubtle: "text-on-navy-subtle",
  onNavyFaint: "text-on-navy-faint",
  brandNavy: "bg-[var(--brand-navy)] text-white",
  brandGold: "text-[var(--brand-gold)]",
  brandGoldBg: "bg-[var(--brand-gold-muted)] text-[var(--brand-gold)]",

  /** Buttons - pair with size/rounding utilities */
  btnGold: "theme-btn-interaction theme-btn-gold",
  btnSecondary: "theme-btn-interaction theme-btn-secondary",
  btnOutline: "theme-btn-interaction theme-btn-outline",
  btnGhost: "theme-btn-interaction theme-btn-ghost",
  btnDark: "theme-btn-interaction theme-btn-dark",
  btnOnDark: "theme-btn-interaction theme-btn-on-dark",
  btnPillActive: "btn-pill btn-pill--active",
  btnPillInactive: "btn-pill btn-pill--inactive",
  btnPillOutline: "btn-pill btn-pill--outline",
  btnPillOutlineActive: "btn-pill btn-pill--outline-active",

  /** Focus */
  focusRing:
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)]",

  /** Sidebar (dashboard) */
  sidebar: "theme-sidebar",

  /** Links */
  link: "theme-link",
  linkMuted: "theme-link-muted",

  /** States */
  disabled: "theme-disabled",

  /** Dashboard card - use on Card or div */
  dashboardCard: "p-6",
} as const;

export type ThemeTokenKey = keyof typeof theme;
