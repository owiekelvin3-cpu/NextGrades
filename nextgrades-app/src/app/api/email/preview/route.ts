import { NextResponse } from "next/server";
import { isResendConfigured } from "@/lib/email";
import { EmailTemplates } from "@/lib/email";

/** Preview email templates in development — GET /api/email/preview?template=welcome */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const template = searchParams.get("template") || "welcome";

  const samples: Record<string, string> = {
    welcome: EmailTemplates.welcomeEmail("Alex", "student"),
    "email-verification": EmailTemplates.emailVerificationEmail("https://nextgrades.com/verify?token=abc", "Alex"),
    "verification-code": EmailTemplates.verificationCodeEmail("482910", "Alex"),
    "password-reset": EmailTemplates.passwordResetEmail("https://nextgrades.com/reset?token=abc", "Alex"),
    "password-changed": EmailTemplates.passwordChangedEmail("Alex"),
    "teacher-approved": EmailTemplates.teacherApprovedEmail("Alex"),
    "teacher-rejected": EmailTemplates.teacherRejectedEmail("Alex", "Incomplete credentials"),
    enrollment: EmailTemplates.enrollmentConfirmationEmail("Alex", "Mathematics Abitur Prep", "Dr. Schmidt"),
    "course-purchase": EmailTemplates.coursePurchaseEmail("Alex", "Physics Masterclass", 49.99, "EUR", "RCP-001"),
    subscription: EmailTemplates.subscriptionConfirmationEmail("Alex", {
      planName: "Premium",
      amount: "€29.99/mo",
      billingCycle: "Monthly",
      renewalDate: "June 30, 2026",
    }),
    "subscription-renewal": EmailTemplates.subscriptionRenewalReminderEmail("Alex", {
      planName: "Premium",
      amount: "€29.99",
      billingCycle: "Monthly",
      renewalDate: "June 30, 2026",
    }),
    "subscription-expiry": EmailTemplates.subscriptionExpiryEmail("Alex", {
      planName: "Premium",
      amount: "€29.99/mo",
      billingCycle: "Monthly",
      expiryDate: "June 30, 2026",
    }),
    receipt: EmailTemplates.paymentReceiptEmail("Alex", [{ label: "Premium Plan", value: "€29.99" }], "€29.99", "INV-001"),
    "contact-confirmation": EmailTemplates.contactConfirmationEmail("Alex", "General inquiry"),
    "contact-admin": EmailTemplates.contactAdminEmail("Alex", "alex@example.com", "Hello!", "General inquiry"),
    "admin-notification": EmailTemplates.adminNotificationEmail("New signup", "A new teacher registered.", "/dashboard/admin"),
    "security-alert": EmailTemplates.securityAlertEmail("Alex", {
      action: "New login from unknown device",
      ipAddress: "192.168.1.1",
      device: "Chrome on Windows",
      timestamp: new Date().toLocaleString("de-DE"),
    }),
  };

  const html = samples[template];
  if (!html) {
    return NextResponse.json({ error: "Unknown template", available: Object.keys(samples) }, { status: 400 });
  }

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }

  if (!isResendConfigured()) {
    return NextResponse.json({ error: "Resend not configured" }, { status: 503 });
  }

  const body = await request.json();
  const { to, template = "welcome" } = body as { to?: string; template?: string };

  if (!to) {
    return NextResponse.json({ error: "to email required" }, { status: 400 });
  }

  const { sendWelcomeEmail, sendVerificationCodeEmail, sendPasswordResetEmail } = await import("@/lib/email");

  const senders: Record<string, () => Promise<{ success: boolean; error?: string }>> = {
    welcome: () => sendWelcomeEmail(to, "Test User"),
    "verification-code": () => sendVerificationCodeEmail(to, "123456", "Test User"),
    "password-reset": () => sendPasswordResetEmail(to, `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`, "Test User"),
  };

  const send = senders[template];
  if (!send) {
    return NextResponse.json({ error: "Unknown template for send test" }, { status: 400 });
  }

  const result = await send();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
