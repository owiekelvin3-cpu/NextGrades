# Resend Email Configuration

Add these to `.env.local` (and production environment):

```env
# Required
RESEND_API_KEY=re_xxxxxxxxxx

# Sender identity (verify domain in Resend dashboard for production)
RESEND_SENDER_EMAIL=noreply@yourdomain.com
RESEND_SENDER_NAME=NextGrades
RESEND_REPLY_TO_EMAIL=support@yourdomain.com

# Recipients
CONTACT_FORM_TO_EMAIL=admin@yourdomain.com
ADMIN_NOTIFICATION_EMAIL=admin@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com

# Optional
NEXT_PUBLIC_EMAIL_LOGO_URL=https://yourdomain.com/logo.png
COMPANY_ADDRESS=NextGrades GmbH, Germany
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Production setup

1. **Verify your domain** at [resend.com/domains](https://resend.com/domains)
2. Set `RESEND_SENDER_EMAIL` to an address on that domain (e.g. `noreply@nextgrades.com`)
3. Configure **Supabase Auth SMTP** (optional) to use Resend for auth emails:
   - Host: `smtp.resend.com`
   - Port: `465` or `587`
   - User: `resend`
   - Password: your `RESEND_API_KEY`

## Preview templates (development only)

Open in browser:
- http://localhost:3000/api/email/preview?template=welcome
- http://localhost:3000/api/email/preview?template=password-reset
- http://localhost:3000/api/email/preview?template=subscription

Available templates: `welcome`, `email-verification`, `verification-code`, `password-reset`, `password-changed`, `teacher-approved`, `teacher-rejected`, `enrollment`, `course-purchase`, `subscription`, `subscription-renewal`, `subscription-expiry`, `receipt`, `contact-confirmation`, `contact-admin`, `admin-notification`, `security-alert`

## Centralized API

All emails are sent via `@/lib/email`:

```ts
import { sendWelcomeEmail, sendPasswordResetEmail } from "@/lib/email";
```

Templates live in `src/lib/email/templates.ts` and share the branded layout in `src/lib/email/layout.ts`.
