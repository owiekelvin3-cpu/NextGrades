/** Bounds dashboard lesson queries for large accounts at scale. */
export const LESSON_HISTORY_MONTHS = 12;
export const LESSON_QUERY_LIMIT = 500;

export function lessonHistorySinceIso(): string {
  const since = new Date();
  since.setMonth(since.getMonth() - LESSON_HISTORY_MONTHS);
  return since.toISOString();
}
