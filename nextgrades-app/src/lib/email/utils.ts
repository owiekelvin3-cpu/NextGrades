export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function displayName(name?: string | null, fallback = ""): string {
  const trimmed = name?.trim();
  return trimmed ? escapeHtml(trimmed) : fallback;
}

export function halloLine(userName?: string | null): string {
  const name = displayName(userName);
  return name ? `Hallo ${name},` : "Hallo,";
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  try {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function formatDate(date: string | Date, locale = "de-DE"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
}
