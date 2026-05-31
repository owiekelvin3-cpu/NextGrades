import {
  getZoomConfig,
  ZOOM_AUTHORIZE_URL,
  ZOOM_OAUTH_SCOPES,
  ZOOM_TOKEN_URL,
} from "./config";

export type ZoomTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
};

export type ZoomUserProfile = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
};

function basicAuthHeader(): string {
  const { clientId, clientSecret } = getZoomConfig();
  if (!clientId || !clientSecret) throw new Error("Zoom OAuth is not configured");
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
}

export function buildZoomAuthorizeUrl(state: string): string {
  const { clientId, redirectUri } = getZoomConfig();
  if (!clientId) throw new Error("Zoom OAuth is not configured");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: ZOOM_OAUTH_SCOPES,
    // Always show Zoom's consent screen so teachers pick their own account.
    prompt: "consent",
  });

  return `${ZOOM_AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeZoomCode(code: string): Promise<ZoomTokenResponse> {
  const { redirectUri } = getZoomConfig();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const res = await fetch(ZOOM_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Zoom token exchange failed: ${err}`);
  }

  return res.json() as Promise<ZoomTokenResponse>;
}

export async function refreshZoomToken(refreshToken: string): Promise<ZoomTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(ZOOM_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Zoom token refresh failed: ${err}`);
  }

  return res.json() as Promise<ZoomTokenResponse>;
}

export async function fetchZoomUser(accessToken: string): Promise<ZoomUserProfile> {
  const res = await fetch("https://api.zoom.us/v2/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Zoom user profile");
  return res.json() as Promise<ZoomUserProfile>;
}

export async function revokeZoomToken(refreshToken: string): Promise<void> {
  await fetch(`https://zoom.us/oauth/revoke?token=${encodeURIComponent(refreshToken)}`, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).catch(() => {
    /* best-effort revoke */
  });
}
