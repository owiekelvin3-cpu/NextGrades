/** Austrian school catalog: grades 1–9 only (no 10–12). */
export const MAX_CLASS_LEVEL = 9;
export const MIN_CLASS_LEVEL = 1;

export type CatalogClassRow = {
  id: string;
  name: string;
  level: number;
  description?: string | null;
};

export function isCatalogClassLevel(level: number): boolean {
  return Number.isFinite(level) && level >= MIN_CLASS_LEVEL && level <= MAX_CLASS_LEVEL;
}

export function filterCatalogClasses<T extends CatalogClassRow>(classes: T[]): T[] {
  return classes.filter((c) => isCatalogClassLevel(c.level));
}

export function clampClassLevel(level: number): number | null {
  if (!Number.isFinite(level) || level < MIN_CLASS_LEVEL) return null;
  return Math.min(level, MAX_CLASS_LEVEL);
}
