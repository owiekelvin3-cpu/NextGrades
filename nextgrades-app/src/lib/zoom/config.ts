export type ZoomMeetingType = "live_class" | "webinar" | "private_session" | "group_session";

export const ZOOM_MEETING_TYPES: ZoomMeetingType[] = [
  "live_class",
  "webinar",
  "private_session",
  "group_session",
];

import { getAppUrl } from "@/lib/app-url";

export type ZoomOAuthEnvironment = "production" | "development";

/**
 * Zoom OAuth credential mode.
 *
 * Development credentials only authorize users on the same Zoom account as the
 * app creator. Production credentials (after Beta Test or publish) are required
 * for external teachers to connect their own Zoom accounts.
 */
export function getZoomOAuthEnvironment(): ZoomOAuthEnvironment {
  const env = process.env.ZOOM_OAUTH_ENV?.trim().toLowerCase();
  if (env === "development" || env === "dev") return "development";
  if (env === "production" || env === "prod") return "production";
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

export function isMultiUserOAuthReady(): boolean {
  return getZoomOAuthEnvironment() === "production";
}

export function getZoomConfig() {
  const oauthEnv = getZoomOAuthEnvironment();
  const useProduction = oauthEnv === "production";

  const clientId = useProduction
    ? process.env.ZOOM_PRODUCTION_CLIENT_ID || process.env.ZOOM_CLIENT_ID
    : process.env.ZOOM_DEVELOPMENT_CLIENT_ID || process.env.ZOOM_CLIENT_ID;

  const clientSecret = useProduction
    ? process.env.ZOOM_PRODUCTION_CLIENT_SECRET || process.env.ZOOM_CLIENT_SECRET
    : process.env.ZOOM_DEVELOPMENT_CLIENT_SECRET || process.env.ZOOM_CLIENT_SECRET;

  const redirectUri =
    (useProduction
      ? process.env.ZOOM_PRODUCTION_REDIRECT_URI || process.env.ZOOM_REDIRECT_URI
      : process.env.ZOOM_DEVELOPMENT_REDIRECT_URI || process.env.ZOOM_REDIRECT_URI) ||
    `${getAppUrl()}/api/zoom/callback`;

  return { clientId, clientSecret, redirectUri, oauthEnv };
}

export function isZoomOAuthConfigured(): boolean {
  const { clientId, clientSecret } = getZoomConfig();
  return Boolean(clientId && clientSecret);
}

export const ZOOM_OAUTH_SCOPES = [
  "meeting:write:meeting",
  "meeting:read:meeting",
  "meeting:delete:meeting",
  "user:read:user",
].join(" ");

export const ZOOM_AUTHORIZE_URL = "https://zoom.us/oauth/authorize";
export const ZOOM_TOKEN_URL = "https://zoom.us/oauth/token";
export const ZOOM_API_BASE = "https://api.zoom.us/v2";
