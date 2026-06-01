# Production deploy checklist (Vercel)

## Code quality (run locally)

```bash
cd nextgrades-app
npm run test
npm run build
npm run predeploy   # uses .env.local — expect blocker until NEXT_PUBLIC_APP_URL is HTTPS
```

After deploy, open `https://YOUR-DOMAIN/api/health` — should return `"status":"ok"` (not `blocked`).

## Required Vercel environment variables

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` (no trailing slash) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (server only) |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_SENDER_EMAIL` | Verified domain address (not `resend.dev` in production) |
| `RESEND_SENDER_NAME` | e.g. `NextGrades` |
| `CONTACT_FORM_TO_EMAIL` | Inbox for contact form |

## Stripe (if using payments)

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Live `pk_live_...` |
| `STRIPE_SECRET_KEY` | Live `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | From Stripe → Webhooks → `https://YOUR-DOMAIN/api/stripe/webhook` |
| `STRIPE_PRICE_*` | Live price IDs |

## Auth (Supabase dashboard)

1. **Authentication → URL configuration**
   - Site URL = `NEXT_PUBLIC_APP_URL`
   - Redirect URLs: `https://YOUR-DOMAIN/auth/callback`, `https://YOUR-DOMAIN/**`
2. Run all SQL in `supabase/migrations/` (including `00025`–`00027` CMS).
3. Run `supabase/FIX_ADMIN_DELETE_USER.sql` if present.

## Recommended production settings

- `REQUIRE_EMAIL_VERIFICATION=true` (or omit — default is on in production)
- Remove `ADMIN_BOOTSTRAP_EMAIL` after first admin exists
- Do **not** set `ALLOW_ADMIN_BOOTSTRAP=true` in production
- `ZOOM_REDIRECT_URI=https://YOUR-DOMAIN/api/zoom/callback` with production Zoom app credentials

## Deploy

Push to `main` (Vercel Git integration) or:

```bash
npx vercel login
npx vercel deploy --prod --yes
```

Root directory in Vercel project settings: `nextgrades-app` (see repo `vercel.json`).
