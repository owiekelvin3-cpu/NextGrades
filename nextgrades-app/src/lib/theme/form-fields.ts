import { cn } from "@/lib/utils";

const selectBase =
  "theme-select transition-all focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-ring)]";

/** Standard text input — matches marketing contact form fields. */
export const themeInputClass =
  "w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-background)] px-4 py-3.5 text-sm text-[var(--input-foreground)] transition-all placeholder:text-[var(--input-placeholder)] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-ring)]";

function isEmptySelectValue(value?: string | number | readonly string[] | null): boolean {
  return value === "" || value === undefined || value === null;
}

/** Full-width select (forms). Pass `value` so empty/placeholder state gets correct contrast in dark mode. */
export function themeSelectClass(
  value?: string | number | readonly string[] | null,
  className?: string
) {
  return cn(
    selectBase,
    "w-full rounded-xl px-4 py-3.5 text-sm",
    isEmptySelectValue(value) && "theme-select--placeholder",
    className
  );
}

/** Compact select (filters, settings, admin tables). */
export function themeSelectCompactClass(
  value?: string | number | readonly string[] | null,
  className?: string
) {
  return cn(
    selectBase,
    "rounded-lg px-3 py-2 text-sm",
    isEmptySelectValue(value) && "theme-select--placeholder",
    className
  );
}

/** Filter-bar select (resources hub / marketplace). */
export function themeSelectFilterClass(
  value?: string | number | readonly string[] | null,
  className?: string
) {
  return cn(
    selectBase,
    "rounded-xl px-4 py-2.5 text-sm",
    isEmptySelectValue(value) && "theme-select--placeholder",
    className
  );
}
