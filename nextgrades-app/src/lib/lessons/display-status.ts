export type LessonDisplayStatus = "upcoming" | "completed" | "cancelled" | "missed" | "no_show";

/** Derive admin-facing display status from DB row + clock. */
export function deriveLessonDisplayStatus(
  row: { status: string; start_time: string },
  now: Date = new Date()
): LessonDisplayStatus {
  const status = row.status;
  const start = new Date(row.start_time);

  if (status === "cancelled") return "cancelled";
  if (status === "completed") return "completed";
  if (status === "no_show") return "no_show";
  if (status === "missed") return "missed";

  if (status === "scheduled") {
    if (start.getTime() >= now.getTime()) return "upcoming";
    return "missed";
  }

  if (start.getTime() < now.getTime()) return "missed";
  return "upcoming";
}

export function meetingLinkFromLesson(row: {
  meeting_url?: string | null;
  zoom_link?: string | null;
}): string | null {
  return row.meeting_url?.trim() || row.zoom_link?.trim() || null;
}
