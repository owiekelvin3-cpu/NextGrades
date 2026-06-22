export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatPrice(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("de-AT", { style: "currency", currency }).format(amount);
}

export function reorderIds<T extends { id: string }>(items: T[], orderedIds: string[]): T[] {
  const map = new Map(items.map((item) => [item.id, item]));
  return orderedIds.map((id) => map.get(id)).filter((item): item is T => Boolean(item));
}
