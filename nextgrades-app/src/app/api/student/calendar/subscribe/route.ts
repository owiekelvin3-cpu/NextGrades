import { NextResponse } from "next/server";
import { requireAuthenticatedApi } from "@/lib/auth/api-auth";
import { getAppUrl } from "@/lib/app-url";
import { createCalendarFeedToken } from "@/lib/calendar/feed-token";
import { buildStudentLessonsIcs } from "@/lib/calendar/ical";
import { fetchStudentLessonsForCalendar } from "@/lib/calendar/student-lessons";

function buildCalendarUrls(token: string) {
  const appUrl = getAppUrl();
  const feedUrl = `${appUrl}/api/calendar/feed/${token}`;
  const webcalUrl = feedUrl.replace(/^https:/, "webcal:").replace(/^http:/, "webcal:");
  const googleCalendarUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl)}`;

  return { feedUrl, webcalUrl, googleCalendarUrl };
}

export async function GET() {
  const gate = await requireAuthenticatedApi();
  if (gate.error) return gate.error;

  const profile = gate.auth!.profile;
  if (profile.role !== "student") {
    return NextResponse.json({ error: "Only students can subscribe to lesson calendars." }, { status: 403 });
  }

  const token = createCalendarFeedToken(profile.id);
  const urls = buildCalendarUrls(token);
  const lessons = await fetchStudentLessonsForCalendar(profile.id);

  return NextResponse.json({
    ...urls,
    lessonCount: lessons.length,
  });
}

/** One-time download for the signed-in student (session auth, no token in browser history). */
export async function POST() {
  const gate = await requireAuthenticatedApi();
  if (gate.error) return gate.error;

  const profile = gate.auth!.profile;
  if (profile.role !== "student") {
    return NextResponse.json({ error: "Only students can download lesson calendars." }, { status: 403 });
  }

  const lessons = await fetchStudentLessonsForCalendar(profile.id);
  const appUrl = getAppUrl();
  const ics = buildStudentLessonsIcs(lessons, "NextGrades lessons", appUrl);

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="nextgrades-lessons.ics"',
      "Cache-Control": "no-store",
    },
  });
}
