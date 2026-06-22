export type CalendarLesson = {
  id: string;
  start_time: string;
  duration: number;
  status: string;
  subject_name?: string;
  teacher_name?: string;
  zoom_link?: string | null;
};

function formatIcalDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function escapeIcalText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function foldLine(line: string): string {
  const max = 75;
  if (line.length <= max) return line;
  const parts: string[] = [line.slice(0, max)];
  let rest = line.slice(max);
  while (rest.length > 0) {
    parts.push(` ${rest.slice(0, max - 1)}`);
    rest = rest.slice(max - 1);
  }
  return parts.join("\r\n");
}

function buildEvent(lesson: CalendarLesson, appUrl: string): string {
  const start = new Date(lesson.start_time);
  const end = new Date(start.getTime() + (lesson.duration || 60) * 60 * 1000);
  const title = [lesson.subject_name || "NextGrades lesson", lesson.teacher_name ? `with ${lesson.teacher_name}` : ""]
    .filter(Boolean)
    .join(" ");

  const descriptionParts = [
    lesson.teacher_name ? `Teacher: ${lesson.teacher_name}` : null,
    lesson.zoom_link ? `Join: ${lesson.zoom_link}` : `Dashboard: ${appUrl}/dashboard/student/appointments`,
  ].filter(Boolean);

  const lines = [
    "BEGIN:VEVENT",
    `UID:lesson-${lesson.id}@nextgrades`,
    `DTSTAMP:${formatIcalDate(new Date().toISOString())}`,
    `DTSTART:${formatIcalDate(start.toISOString())}`,
    `DTEND:${formatIcalDate(end.toISOString())}`,
    foldLine(`SUMMARY:${escapeIcalText(title)}`),
    foldLine(`DESCRIPTION:${escapeIcalText(descriptionParts.join("\n"))}`),
    `STATUS:${lesson.status === "cancelled" ? "CANCELLED" : "CONFIRMED"}`,
    `URL:${appUrl}/dashboard/student/appointments`,
  ];

  if (lesson.zoom_link) {
    lines.push(foldLine(`LOCATION:${escapeIcalText(lesson.zoom_link)}`));
  }

  lines.push("END:VEVENT");
  return lines.join("\r\n");
}

export function buildStudentLessonsIcs(lessons: CalendarLesson[], calendarName: string, appUrl: string): string {
  const now = formatIcalDate(new Date().toISOString());
  const events = lessons.map((lesson) => buildEvent(lesson, appUrl)).join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NextGrades//Student Appointments//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    foldLine(`X-WR-CALNAME:${escapeIcalText(calendarName)}`),
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
    now ? `DTSTAMP:${now}` : "",
    events,
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}
