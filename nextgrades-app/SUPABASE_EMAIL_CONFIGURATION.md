# Supabase Authentication Email Customization Guide

This guide explains how to fully customize Supabase authentication emails to match NextGrades' premium brand identity.

## Overview

NextGrades uses **Resend** for sending custom branded emails while Supabase handles the authentication logic. This approach gives us complete control over email design and messaging while maintaining Supabase's security features.

## Current Setup

- **Email Service**: Resend (configured via `@/lib/email/index.ts`)
- **Email Templates**: Located in `@/lib/email/templates/`
- **Base Template**: `base.tsx` - Contains all styling and layout
- **Custom Templates**:
  - `password-reset.ts` - Password reset emails
  - `verification.ts` - Email verification
  - `welcome.ts` - Welcome after signup
  - `magic-link.ts` - Magic link authentication
  - `invite.ts` - Invite emails for teachers/students
  - `change-email.ts` - Email change confirmation
  - `signup-confirmation.ts` - Signup success message
  - `notification.ts` - General notification template

## Email Template Architecture

### Base Template (`base.tsx`)

The base template contains:
- Premium gradient header with NextGrades branding
- Responsive mobile-first design
- Inline CSS styling for email client compatibility
- Brand colors (Deep Navy #0D1B2A, Gold #D4AF37)
- Professional footer with links and social options
- Support for light mode (emails are better in light mode)
- Accessibility features (proper contrast, semantic HTML)

### Brand Colors Used

```css
--color-deep-navy: #0D1B2A;
--color-gold: #D4AF37;
--color-gold-light: #F5A623;
--color-white: #FFFFFF;
--color-gray-light: #F5F5F5;
--color-green: #22C55E;
```

### CSS Classes Available

```html
<!-- Button styles -->
<a href="#" class="btn">Primary Button</a>
<a href="#" class="btn btn-secondary">Secondary Button</a>

<!-- Alert boxes -->
<div class="security-notice">...</div>
<div class="info-box">...</div>

<!-- Feature lists -->
<ul class="feature-list">
  <li>Feature 1</li>
  <li>Feature 2</li>
</ul>

<!-- Dividers -->
<div class="divider"></div>
```

## Email Types and Copywriting

### 1. Email Verification
- **Purpose**: Confirm user email during signup
- **Tone**: Welcoming, encouraging
- **CTA**: "Verify My Email Address"
- **Expiry**: 24 hours
- **Copy**: Natural, explains benefits of verification

### 2. Welcome Email
- **Purpose**: First impression after account creation
- **Tone**: Enthusiastic, supportive
- **CTA**: "Start Your Learning Journey"
- **Features**: Lists key benefits and quick start guide
- **Copy**: Human, friendly tone about learning experience

### 3. Password Reset
- **Purpose**: Help users recover account access
- **Tone**: Helpful, secure-focused
- **CTA**: "Reset My Password"
- **Expiry**: 1 hour
- **Security Message**: Explains security measures
- **Copy**: Reassures users about account safety

### 4. Magic Link Login
- **Purpose**: Passwordless login option
- **Tone**: Modern, convenient
- **CTA**: "Login to NextGrades"
- **Expiry**: 15 minutes
- **Copy**: Explains magic link convenience and security

### 5. Invite Emails
- **Purpose**: Invite students to classes or learning groups
- **Tone**: Professional, inclusive
- **CTA**: "Accept Invitation"
- **Expiry**: 7 days
- **Personalization**: Includes inviter name and optional message
- **Copy**: Explains platform benefits and next steps

### 6. Change Email Confirmation
- **Purpose**: Confirm email address change
- **Tone**: Secure, confirmatory
- **CTA**: "Confirm Email Change"
- **Expiry**: 24 hours
- **Security**: Emphasizes security measures
- **Copy**: Clear explanation of what happens next

### 7. Signup Confirmation
- **Purpose**: Post-signup acknowledgment with next steps
- **Tone**: Encouraging, role-specific
- **CTA**: "Go to Your Dashboard"
- **Personalization**: Different for students vs. teachers
- **Copy**: Role-specific guidance and features

## Integration Points

### Sending Verification Emails

Currently handled by Supabase automatically. To override:

```typescript
// When user signs up
await sendVerificationEmail(
  email,
  verificationUrl,
  userName
);
```

### Sending Password Reset Emails

Currently handled by Supabase automatically. To send custom emails:

```typescript
// After password reset request
await sendPasswordResetEmail(
  email,
  resetUrl,
  userName
);
```

### Sending Welcome Emails

Send after email verification:

```typescript
await sendWelcomeEmail(email, userName);
```

### Sending Signup Confirmation

Send after successful email verification:

```typescript
await sendSignupConfirmationEmail(
  email,
  userName,
  role // 'student' or 'teacher'
);
```

## Setting Up Supabase Custom Email Templates

### Option 1: Use Supabase's Email Template Editor (Recommended)

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Authentication** → **Email Templates**
3. For each template type, you can customize:
   - Subject line
   - Email body (HTML)
   - Variables available for that email type

### Option 2: Using Supabase API

You can also configure emails via the Supabase Management API:

```typescript
// Example: Setting a custom email template
const response = await fetch(
  'https://api.supabase.com/auth/v1/admin/projects/{project-id}/config/email-templates/{email-type}',
  {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: 'Custom Subject',
      template: customEmailHTML,
    }),
  }
);
```

## Available Email Template Variables

### Password Reset Email
- `{{ .SiteURL }}` - Your application URL
- `{{ .TokenHash }}` - Token for reset link
- `{{ .Email }}` - User's email address
- `{{ .Data.user_name }}` - User's name (if stored)

### Email Verification
- `{{ .SiteURL }}` - Your application URL
- `{{ .TokenHash }}` - Token for verification link
- `{{ .Email }}` - User's email address

### Magic Link
- `{{ .SiteURL }}` - Your application URL
- `{{ .TokenHash }}` - Token for magic link
- `{{ .Email }}` - User's email address

## Email Rendering Testing

### Test Email Clients

1. **Gmail** - Most users
2. **Outlook/Hotmail** - Business users
3. **Apple Mail** - iOS/macOS users
4. **Mobile Clients** - Gmail app, Yahoo Mail app
5. **Dark Mode** - Supported across all major clients

### Testing Tools

- **Litmus** (litmus.com) - Professional email testing
- **Email on Acid** (emailonacid.com) - Comprehensive testing
- **Stripo** (stripo.email) - Template preview and testing
- **Mailmodo** (mailmodo.com) - Interactive emails

### Mobile Responsiveness

All templates are optimized for:
- ✅ iPhone (375px width)
- ✅ Android (320-480px width)
- ✅ Desktop (600px content width)
- ✅ Tablet (768px+)

### Dark Mode Compatibility

Emails use:
- `@media (prefers-color-scheme: dark)` - Dark mode support
- Light backgrounds (no dark backgrounds in email HTML)
- High contrast text for readability
- Color gradients that work in light mode

## Supabase Configuration Checklist

### Before Deploying

- [ ] Set `RESEND_SENDER_EMAIL` environment variable
- [ ] Verify Resend API key is configured
- [ ] Test email sending with a test account
- [ ] Verify email addresses are whitelisted in Resend
- [ ] Check spam folder for emails
- [ ] Test on multiple email clients
- [ ] Verify dark mode rendering
- [ ] Test on mobile devices
- [ ] Check link click-through tracking
- [ ] Verify unsubscribe links (optional)

### Email Configuration in `.env.local`

```env
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_SENDER_EMAIL=noreply@nextgrades.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URLs
NEXT_PUBLIC_APP_URL=https://nextgrades.com
```

## Custom Domain Configuration

For best email deliverability:

1. **Add Custom Domain to Resend**
   - Go to Resend Dashboard
   - Add domain (e.g., mail.nextgrades.com)
   - Verify DNS records
   - Enable DKIM signing

2. **DNS Records Required**
   ```
   Type: MX
   Value: feedback-smtp.region.amazonses.com
   
   Type: TXT (SPF)
   Value: v=spf1 include:sendingservice.net ~all
   
   Type: CNAME (DKIM)
   Value: provided by Resend
   ```

3. **Reply-To Address**
   - Set in Resend: `support@nextgrades.com`
   - Update `getSenderEmail()` in email/index.ts

## Error Handling

### Common Issues

**Issue**: Emails not being delivered
- ✓ Check RESEND_API_KEY is correct
- ✓ Verify sender email is verified in Resend
- ✓ Check spam/junk folder
- ✓ Verify email address is correct

**Issue**: Emails going to spam
- ✓ Add SPF/DKIM records
- ✓ Use custom domain
- ✓ Ensure consistent branding
- ✓ Avoid spam trigger words

**Issue**: Templates not rendering
- ✓ Check inline CSS is present
- ✓ Verify email client compatibility
- ✓ Test image loading
- ✓ Check link formatting

## Performance & Analytics

### Email Delivery Metrics

Monitor in Resend Dashboard:
- Delivery rate
- Open rate
- Click-through rate
- Bounce rate
- Complaint rate

### Best Practices

1. **Subject Lines**
   - Keep under 50 characters
   - Include emoji sparingly
   - Make actionable and clear
   - Avoid spam triggers

2. **Content**
   - Keep emails concise
   - Use clear hierarchy
   - Include multiple CTAs
   - Add fallback text links

3. **Design**
   - Use web-safe fonts
   - Ensure 600px max width
   - Include alt text for images
   - Test before sending

4. **Personalization**
   - Use user's name when available
   - Role-specific content
   - Context-aware messaging
   - Time-sensitive information

## Future Enhancements

Potential improvements:
- [ ] A/B testing for email subject lines
- [ ] Dynamic content based on user behavior
- [ ] Multi-language email support
- [ ] Email preference center
- [ ] Advanced analytics integration
- [ ] SMS fallback for critical emails
- [ ] Email templates in database
- [ ] Scheduled email campaigns

## Support & Troubleshooting

### Useful Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Resend Documentation](https://resend.com/docs)
- [Email Standards](https://www.campaignmonitor.com/css/)
- [MJML Email Framework](https://mjml.io/) - Alternative template approach

### Contacting Support

- **Supabase**: https://supabase.com/support
- **Resend**: https://resend.com/support
- **Internal**: Create an issue in the NextGrades repo

## Version History

- **v1.0** (May 2026) - Initial premium email templates
  - Custom base template with brand colors
  - 7 email types
  - Mobile responsive design
  - Dark mode support
  - Security messaging
