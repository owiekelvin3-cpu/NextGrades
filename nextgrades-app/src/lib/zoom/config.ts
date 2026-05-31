export type ZoomMeetingType = "live_class" | "webinar" | "private_session" | "group_session";

export const ZOOM_MEETING_TYPES: ZoomMeetingType[] = [
  "live_class",
  "webinar",
  "private_session",
  "group_session",
];

export function getZoomConfig() {
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;
  const redirectUri =
    process.env.ZOOM_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/zoom/callback`;

  return { clientId, clientSecret, redirectUri };
}

export function isZoomOAuthConfigured(): boolean {
  const { clientId, clientSecret } = getZoomConfig();
  return Boolean(clientId && clientSecret);
}

export const ZOOM_OAUTH_SCOPES = [
  "meeting:write:meeting",
  "meeting:read:meeting",
  "user:read:user",
].join(" ");

export const ZOOM_AUTHORIZE_URL = "https://zoom.us/oauth/authorize";
export const ZOOM_TOKEN_URL = "https://zoom.us/oauth/token";
export const ZOOM_API_BASE = "https://api.zoom.us/v2";
