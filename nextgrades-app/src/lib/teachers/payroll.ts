/** Calendar-month bounds for teacher payroll (UTC-safe via local month). */
export function parsePayrollMonth(value: string | null | undefined): { year: number; month: number; key: string } {
  const now = new Date();
  const fallback = { year: now.getFullYear(), month: now.getMonth() + 1 };
  if (!value?.trim()) {
    return {
      ...fallback,
      key: `${fallback.year}-${String(fallback.month).padStart(2, "0")}`,
    };
  }
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return {
      ...fallback,
      key: `${fallback.year}-${String(fallback.month).padStart(2, "0")}`,
    };
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) {
    return {
      ...fallback,
      key: `${fallback.year}-${String(fallback.month).padStart(2, "0")}`,
    };
  }
  return { year, month, key: `${year}-${String(month).padStart(2, "0")}` };
}

export function monthRangeIso(year: number, month: number): { start: string; end: string } {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 1, 0, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatPayrollMonthLabel(year: number, month: number, locale = "de-AT"): string {
  return new Date(year, month - 1, 1).toLocaleDateString(locale, { month: "long", year: "numeric" });
}

export type LedgerRow = {
  id: string;
  lesson_id: string | null;
  amount: number;
  entry_type: string;
  status: string;
  note: string | null;
  created_at: string;
  paid_at: string | null;
};

export function sumLessonEarningsInRange(
  entries: LedgerRow[],
  start: string,
  end: string,
  status?: "pending" | "paid"
): number {
  return roundMoney(
    entries
      .filter((e) => {
        if (e.entry_type !== "lesson_completed" || e.status === "void") return false;
        if (status && e.status !== status) return false;
        const at = e.created_at;
        return at >= start && at < end;
      })
      .reduce((sum, e) => sum + Number(e.amount ?? 0), 0)
  );
}

export function countLessonEntriesInRange(entries: LedgerRow[], start: string, end: string): number {
  return entries.filter(
    (e) =>
      e.entry_type === "lesson_completed" &&
      e.status !== "void" &&
      e.created_at >= start &&
      e.created_at < end
  ).length;
}
