# Zoom OAuth setup for NextGrades

NextGrades uses Zoom OAuth so each **teacher connects their own Zoom account**. The OAuth flow in code is standard and does **not** depend on which Zoom account is logged into the browser.

If teachers see **"Application Not Found"** on `zoom.us` (unless the Zoom developer account is logged in), the app is still using **Development** credentials. That is a Zoom Marketplace restriction, not a NextGrades bug.

## Why this happens

| Mode | Who can connect |
|------|-----------------|
| **Development** | Only users on the same Zoom account as the app creator (or users on the dev allowlist) |
| **Production** (Beta Test or Published) | Any Zoom user who authorizes the app |

Development and Production use **different Client ID and Client Secret** values in Zoom Marketplace.

## Fix: enable multi-teacher OAuth

### 1. Zoom Marketplace app setup

1. Open [Zoom Marketplace](https://marketplace.zoom.us/) → **Develop** → your OAuth app.
2. Under **Scopes**, ensure these are enabled:
   - `meeting:write:meeting`
   - `meeting:read:meeting`
   - `meeting:delete:meeting`
   - `user:read:user`
3. Choose one path for external users:

   **Option A — Beta Test (fastest for testing)**
   - Go to **Beta Test** → **Request to Share**.
   - After approval, external Zoom accounts can authorize the app using **Production** credentials.

   **Option B — Publish**
   - Submit the app for review and publish (listed or unlisted).

### 2. Production redirect URL

In your app settings, open the **Production** section (not Development):

- Add redirect URL: `https://your-domain.com/api/zoom/callback`
- For local testing with Production creds: `http://localhost:3000/api/zoom/callback`

The redirect URL must **exactly** match `ZOOM_REDIRECT_URI` in your environment.

### 3. Environment variables

Use credentials from the **Production** tab:

```env
ZOOM_OAUTH_ENV=production
ZOOM_CLIENT_ID=<Production Client ID>
ZOOM_CLIENT_SECRET=<Production Client Secret>
ZOOM_REDIRECT_URI=https://your-domain.com/api/zoom/callback
```

Restart the Next.js server after changing env vars.

Optional split for local dev vs production deploy:

```env
ZOOM_OAUTH_ENV=production
ZOOM_PRODUCTION_CLIENT_ID=...
ZOOM_PRODUCTION_CLIENT_SECRET=...
ZOOM_PRODUCTION_REDIRECT_URI=https://your-domain.com/api/zoom/callback
ZOOM_DEVELOPMENT_CLIENT_ID=...
ZOOM_DEVELOPMENT_CLIENT_SECRET=...
ZOOM_DEVELOPMENT_REDIRECT_URI=http://localhost:3000/api/zoom/callback
```

When `ZOOM_OAUTH_ENV=development` (default locally if unset), only the app owner's Zoom account can connect.

### 4. Verify

1. **Admin** → **Zoom** dashboard should show: *"Zoom OAuth is configured for multi-teacher use (Production mode)."*
2. Log out of the developer Zoom account in the browser (or use incognito).
3. Sign in to NextGrades as a teacher and click **Connect Zoom**.
4. Sign in with the teacher's own Zoom account and approve scopes.

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| "Application Not Found" on zoom.us | Development credentials, or app not Beta/Published |
| Works only when developer is logged into Zoom | Development mode — switch to Production credentials |
| Token exchange failed | Redirect URI mismatch between Zoom Marketplace and `ZOOM_REDIRECT_URI` |
| `invalid_client` | Wrong Client ID/Secret pair (mixing Dev and Prod) |

## Code reference

- Authorize URL includes `prompt=consent` so teachers always pick their Zoom account.
- `/api/zoom/status` returns `oauthEnv` and `multiUserReady` for UI warnings.
- Admin `/portal/admin/zoom` shows OAuth mode status.
