/**
 * NextGrades Email Service - centralized Resend integration
 * All platform emails are sent through this module.
 */
import { sendEmail, sendToAdmin, isResendConfigured } from "./send";
import {
  welcomeEmail,
  emailVerificationEmail,
  verificationCodeEmail,
  loginVerificationCodeEmail,
  passwordResetEmail,
  passwordChangedEmail,
  teacherApprovedEmail,
  teacherRejectedEmail,
  enrollmentConfirmationEmail,
  coursePurchaseEmail,
  subscriptionConfirmationEmail,
  subscriptionRenewalReminderEmail,
  subscriptionExpiryEmail,
  paymentReceiptEmail,
  contactConfirmationEmail,
  contactAdminEmail,
  guestAccountSetupAdminEmail,
  guestAccountSetupConfirmationEmail,
  adminNotificationEmail,
  securityAlertEmail,
  notificationEmail,
} from "./templates";
import magicLinkEmail from "./templates/magic-link";
import inviteEmail from "./templates/invite";
import changeEmailEmail from "./templates/change-email";
import signupConfirmationEmail from "./templates/signup-confirmation";
import {
  accountCredentialsEmail,
  accountCredentialsEmailPlain,
} from "./templates/account-credentials";
import {
  accountInvitationEmail,
  accountInvitationEmailPlain,
} from "./templates/account-invitation";
import type { PaymentLineItem, SecurityAlertDetails, SubscriptionDetails } from "./types";

export { isResendConfigured };
export type { SendEmailResult, PaymentLineItem, SecurityAlertDetails, SubscriptionDetails } from "./types";
export { EMAIL_BRAND, getSenderFrom, getAdminEmail } from "./config";

// ─── Account emails ─────────────────────────────────────────────────────────

export async function sendWelcomeEmail(email: string, userName?: string, role: "student" | "teacher" = "student") {
  return sendEmail({
    to: email,
    subject: "Willkommen bei NextGrades!",
    html: welcomeEmail(userName, role),
    tags: [{ name: "category", value: "welcome" }],
  });
}

export async function sendVerificationEmail(email: string, verifyUrl: string, userName?: string) {
  const { accountVerificationEmailPlain } = await import("./templates/account-verification");
  return sendEmail({
    to: email,
    subject: "NextGrades - Bitte bestätige deine E-Mail-Adresse",
    html: emailVerificationEmail(verifyUrl, userName),
    text: accountVerificationEmailPlain(verifyUrl, userName),
    tags: [{ name: "category", value: "verification" }],
  });
}

export async function sendVerificationCodeEmail(email: string, code: string, userName?: string) {
  const { accountVerificationCodeEmail, accountVerificationCodeEmailPlain } = await import(
    "./templates/account-verification-code"
  );
  return sendEmail({
    to: email,
    subject: `NextGrades - Dein Bestätigungscode: ${code}`,
    html: accountVerificationCodeEmail(code, userName),
    text: accountVerificationCodeEmailPlain(code, userName),
    tags: [{ name: "category", value: "verification-code" }],
  });
}

export async function sendLoginVerificationCodeEmail(email: string, code: string, userName?: string) {
  const name = userName?.trim() || "";
  return sendEmail({
    to: email,
    subject: `${code} ist dein NextGrades-Anmeldecode`,
    html: loginVerificationCodeEmail(code, userName),
    text: `${name ? `Hallo ${name},` : "Hallo,"}\n\nDein NextGrades-Anmeldecode lautet: ${code}\n\nDieser Code ist 10 Minuten gültig. Wenn du dich nicht anmelden wolltest, kannst du diese E-Mail ignorieren.\n\nNextGrades`,
    tags: [{ name: "category", value: "2fa" }],
  });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string, userName?: string) {
  return sendEmail({
    to: email,
    subject: "Setze dein NextGrades-Passwort zurück",
    html: passwordResetEmail(resetUrl, userName),
    tags: [{ name: "category", value: "password-reset" }],
  });
}

export async function sendPasswordChangedEmail(email: string, userName?: string) {
  return sendEmail({
    to: email,
    subject: "Dein NextGrades-Passwort wurde geändert",
    html: passwordChangedEmail(userName, new Date().toLocaleString("de-DE")),
    tags: [{ name: "category", value: "password-changed" }],
  });
}

// ─── Teacher emails ─────────────────────────────────────────────────────────

export async function sendTeacherApprovedEmail(email: string, userName?: string) {
  return sendEmail({
    to: email,
    subject: "Dein NextGrades-Lehrkonto ist freigeschaltet!",
    html: teacherApprovedEmail(userName),
    tags: [{ name: "category", value: "teacher-approved" }],
  });
}

export async function sendTeacherRejectedEmail(email: string, userName?: string, reason?: string) {
  return sendEmail({
    to: email,
    subject: "Update zu deiner NextGrades-Lehrkraft-Bewerbung",
    html: teacherRejectedEmail(userName, reason),
    tags: [{ name: "category", value: "teacher-rejected" }],
  });
}

// ─── Commerce emails ────────────────────────────────────────────────────────

export async function sendEnrollmentConfirmationEmail(
  email: string,
  userName: string | undefined,
  courseName: string,
  teacherName?: string
) {
  return sendEmail({
    to: email,
    subject: `Angemeldet: ${courseName}`,
    html: enrollmentConfirmationEmail(userName, courseName, teacherName),
    tags: [{ name: "category", value: "enrollment" }],
  });
}

export async function sendCoursePurchaseEmail(
  email: string,
  userName: string | undefined,
  courseName: string,
  amount: number,
  currency = "EUR",
  receiptId?: string
) {
  return sendEmail({
    to: email,
    subject: `Kauf bestätigt: ${courseName}`,
    html: coursePurchaseEmail(userName, courseName, amount, currency, receiptId),
    tags: [{ name: "category", value: "course-purchase" }],
  });
}

export async function sendSubscriptionConfirmationEmail(
  email: string,
  userName: string | undefined,
  details: SubscriptionDetails
) {
  return sendEmail({
    to: email,
    subject: "Dein NextGrades-Abo ist aktiv",
    html: subscriptionConfirmationEmail(userName, details),
    tags: [{ name: "category", value: "subscription" }],
  });
}

export async function sendSubscriptionRenewalReminderEmail(
  email: string,
  userName: string | undefined,
  details: SubscriptionDetails
) {
  return sendEmail({
    to: email,
    subject: "Dein NextGrades-Abo wird bald verlängert",
    html: subscriptionRenewalReminderEmail(userName, details),
    tags: [{ name: "category", value: "subscription-renewal" }],
  });
}

export async function sendSubscriptionExpiryEmail(
  email: string,
  userName: string | undefined,
  details: SubscriptionDetails
) {
  return sendEmail({
    to: email,
    subject: "Dein NextGrades-Abo läuft bald ab",
    html: subscriptionExpiryEmail(userName, details),
    tags: [{ name: "category", value: "subscription-expiry" }],
  });
}

export async function sendPaymentReceiptEmail(
  email: string,
  userName: string | undefined,
  items: PaymentLineItem[],
  total: string,
  receiptId?: string,
  invoiceUrl?: string
) {
  return sendEmail({
    to: email,
    subject: "Dein NextGrades-Zahlungsbeleg",
    html: paymentReceiptEmail(userName, items, total, receiptId, invoiceUrl),
    tags: [{ name: "category", value: "payment-receipt" }],
  });
}

// ─── Contact & admin emails ─────────────────────────────────────────────────

export async function sendContactFormEmails(
  name: string,
  email: string,
  message: string,
  subject: string,
  phone?: string
) {
  const [adminResult, userResult] = await Promise.all([
    sendToAdmin(`[NextGrades Kontakt] ${subject}`, contactAdminEmail(name, email, message, subject, phone)),
    sendEmail({
      to: email,
      subject: "Wir haben deine Nachricht erhalten – NextGrades",
      html: contactConfirmationEmail(name, subject),
      replyTo: undefined,
    }),
  ]);
  return { admin: adminResult, user: userResult };
}

export async function sendAdminNotificationEmail(
  title: string,
  message: string,
  actionUrl?: string,
  actionLabel?: string
) {
  return sendToAdmin(`[Admin] ${title}`, adminNotificationEmail(title, message, actionUrl, actionLabel));
}

export async function sendGuestAccountSetupEmails(details: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  parentName?: string;
  notes?: string;
  subjectName?: string;
  grade?: string;
  semester?: string;
  planName?: string;
  stripeSessionId: string;
  paymentEmail?: string;
}) {
  const [adminResult, userResult] = await Promise.all([
    sendToAdmin(
      "[NextGrades] Bezahlte Anmeldung – Konto anlegen",
      guestAccountSetupAdminEmail(details)
    ),
    sendEmail({
      to: details.email,
      subject: "NextGrades – wir richten dein Konto ein",
      html: guestAccountSetupConfirmationEmail(details.firstName, details.subjectName),
    }),
  ]);
  return { admin: adminResult, user: userResult };
}

export async function sendSecurityAlertEmail(
  email: string,
  userName: string | undefined,
  details: SecurityAlertDetails
) {
  return sendEmail({
    to: email,
    subject: "Sicherheitshinweis – Aktivität in deinem NextGrades-Konto",
    html: securityAlertEmail(userName, details),
    tags: [{ name: "category", value: "security" }],
  });
}

export async function sendNotificationEmail(
  email: string,
  title: string,
  message: string,
  ctaText?: string,
  ctaUrl?: string,
  userName?: string
) {
  return sendEmail({
    to: email,
    subject: title,
    html: notificationEmail(title, message, ctaText, ctaUrl, userName),
    tags: [{ name: "category", value: "notification" }],
  });
}

export async function sendMagicLinkEmail(email: string, loginUrl: string, userName?: string) {
  return sendEmail({
    to: email,
    subject: "Dein NextGrades-Anmeldelink",
    html: magicLinkEmail(loginUrl, userName),
    tags: [{ name: "category", value: "magic-link" }],
  });
}

export async function sendInviteEmail(
  email: string,
  acceptUrl: string,
  inviterName: string,
  inviteMessage?: string,
  role: "student" | "teacher" = "student"
) {
  return sendEmail({
    to: email,
    subject: `${inviterName} hat dich zu NextGrades eingeladen`,
    html: inviteEmail(acceptUrl, inviterName, inviteMessage, role),
    tags: [{ name: "category", value: "invite" }],
  });
}

export async function sendAccountCredentialsEmail(params: {
  email: string;
  password: string;
  userName?: string;
  role: "student" | "teacher";
  loginUrl: string;
}) {
  return sendEmail({
    to: params.email,
    subject: "Deine NextGrades Zugangsdaten",
    html: accountCredentialsEmail(params),
    text: accountCredentialsEmailPlain(params),
    tags: [{ name: "category", value: "admin-credentials" }],
  });
}

export async function sendAccountInvitationEmail(params: {
  email: string;
  userName?: string;
  role: "student" | "teacher" | "admin";
  setupUrl: string;
}) {
  return sendEmail({
    to: params.email,
    subject: "Deine NextGrades Einladung - Passwort festlegen",
    html: accountInvitationEmail(params),
    text: accountInvitationEmailPlain(params),
    tags: [{ name: "category", value: "admin-invitation" }],
  });
}

export async function sendChangeEmailEmail(email: string, confirmUrl: string, newEmail: string, userName?: string) {
  return sendEmail({
    to: email,
    subject: "Bestätige deine neue NextGrades-E-Mail",
    html: changeEmailEmail(confirmUrl, newEmail, userName),
    tags: [{ name: "category", value: "change-email" }],
  });
}

export async function sendSignupConfirmationEmail(
  email: string,
  userName?: string,
  role: "student" | "teacher" = "student"
) {
  return sendEmail({
    to: email,
    subject: "Dein NextGrades-Konto ist bereit!",
    html: signupConfirmationEmail(userName, role),
    tags: [{ name: "category", value: "signup-confirmation" }],
  });
}

// Re-export templates for preview/testing
export * as EmailTemplates from "./templates";
