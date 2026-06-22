import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/app-url";
import { verifyCalendarFeedToken } from "@/lib/calendar/feed-token";
import { buildStudentLessonsIcs } from "@/lib/calendar/ical";
import { fetchStudentLessonsForCalendar } from "@/lib/calendar/student-lessons";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const userId = verifyCalendarFeedToken(token);

  if (!userId) {
    return new NextResponse("Invalid or expired calendar link.", { status: 404 });
  }

  const lessons = await fetchStudentLessonsForCalendar(userId);
  const appUrl = getAppUrl();
  const ics = buildStudentLessonsIcs(lessons, "NextGrades lessons", appUrl);

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="nextgrades-lessons.ics"',
      "Cache-Control": "private, max-age=300",
    },
  });
}
