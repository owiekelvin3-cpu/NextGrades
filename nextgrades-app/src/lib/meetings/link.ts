export type MeetingProvider = "zoom" | "google_meet" | "microsoft_teams" | "external";

const PROVIDER_PATTERNS: { provider: MeetingProvider; test: RegExp }[] = [
  { provider: "zoom", test: /zoom\.(us|com)/i },
  { provider: "google_meet", test: /meet\.google\.com/i },
  { provider: "microsoft_teams", test: /teams\.(microsoft\.com|live\.com)/i },
];

export function detectMeetingProvider(url: string): MeetingProvider {
  for (const { provider, test } of PROVIDER_PATTERNS) {
    if (test.test(url)) return provider;
  }
  return "external";
}

export function normalizeMeetingUrl(raw: string): string {
  return raw.trim();
}

export type MeetingLinkValidation =
  | { ok: true; url: string; provider: MeetingProvider }
  | { ok: false; error: string };

/** Validate a teacher-pasted video meeting link. */
export function validateMeetingLink(raw: string): MeetingLinkValidation {
  const trimmed = normalizeMeetingUrl(raw);
  if (!trimmed) {
    return { ok: false, error: "Meeting link is required" };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, error: "Enter a valid URL (must start with https://)" };
  }

  if (parsed.protocol !== "https:") {
    return { ok: false, error: "Meeting link must use HTTPS for security" };
  }

  const host = parsed.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local")) {
    return { ok: false, error: "Local URLs are not allowed" };
  }

  return {
    ok: true,
    url: parsed.toString(),
    provider: detectMeetingProvider(parsed.toString()),
  };
}

export function resolveLessonMeetingUrl(lesson: {
  meeting_url?: string | null;
  zoom_link?: string | null;
}): string | null {
  const url = lesson.meeting_url?.trim() || lesson.zoom_link?.trim();
  return url || null;
}

export function lessonHasMeetingLink(lesson: {
  meeting_url?: string | null;
  zoom_link?: string | null;
  zoom_meeting_id?: string | null;
}): boolean {
  return Boolean(resolveLessonMeetingUrl(lesson) || lesson.zoom_meeting_id);
}

export function providerLabel(provider: MeetingProvider | string | null | undefined): string {
  switch (provider) {
    case "zoom":
      return "Zoom";
    case "google_meet":
      return "Google Meet";
    case "microsoft_teams":
      return "Microsoft Teams";
    default:
      return "Video call";
  }
}
