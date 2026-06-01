/** True when running a production build/runtime. */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Admin bootstrap is disabled in production unless explicitly allowed. */
export function isAdminBootstrapAllowed(): boolean {
  if (!isProduction()) return true;
  return process.env.ALLOW_ADMIN_BOOTSTRAP === "true";
}

type EnvIssue = { level: "error" | "warn"; message: string };

/** Validate critical production configuration at startup. */
export function validateProductionEnv(): EnvIssue[] {
  if (!isProduction()) return [];

  const issues: EnvIssue[] = [];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "";

  if (!appUrl || appUrl.includes("localhost") || appUrl.includes("127.0.0.1")) {
    issues.push({
      level: "error",
      message: "NEXT_PUBLIC_APP_URL must be set to your public HTTPS domain in production.",
    });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http")) {
    issues.push({ level: "error", message: "NEXT_PUBLIC_SUPABASE_URL is missing or invalid." });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    issues.push({ level: "error", message: "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing." });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY === "your-service-role-key") {
    issues.push({
      level: "error",
      message: "SUPABASE_SERVICE_ROLE_KEY is required in production for admin and file operations.",
    });
  }

  if (process.env.REQUIRE_EMAIL_VERIFICATION === "false") {
    issues.push({
      level: "warn",
      message: "REQUIRE_EMAIL_VERIFICATION=false — accounts can activate without email verification.",
    });
  }

  if (process.env.ALLOW_ADMIN_BOOTSTRAP === "true") {
    issues.push({
      level: "warn",
      message: "ALLOW_ADMIN_BOOTSTRAP=true — disable after creating your admin account.",
    });
  }

  if (!process.env.RESEND_API_KEY) {
    issues.push({
      level: "warn",
      message: "RESEND_API_KEY missing — password reset and contact form emails will fail.",
    });
  }

  if (process.env.RESEND_SENDER_EMAIL?.includes("resend.dev")) {
    issues.push({
      level: "warn",
      message: "RESEND_SENDER_EMAIL uses resend.dev — verify a custom domain for production email.",
    });
  }

  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_WEBHOOK_SECRET) {
    issues.push({
      level: "warn",
      message: "STRIPE_WEBHOOK_SECRET missing — subscription payments will not sync to the database.",
    });
  }

  if (process.env.ZOOM_CLIENT_ID && (process.env.ZOOM_REDIRECT_URI?.includes("localhost") ?? false)) {
    issues.push({
      level: "warn",
      message: "ZOOM_REDIRECT_URI still points to localhost — update for production Zoom OAuth.",
    });
  }

  return issues;
}
