/**
 * Centralized NextGrades email templates — all transactional emails in one place.
 */
import { getAppUrl } from "./config";
import {
  wrapEmail,
  emailHeading,
  emailSubheading,
  emailParagraph,
  emailButton,
  emailNotice,
  emailCodeBlock,
  emailLinkBlock,
  emailDetailTable,
  emailFeatureList,
  emailSignature,
  emailDivider,
} from "./layout";
import { displayName, escapeHtml, formatCurrency, formatDate } from "./utils";
import type { PaymentLineItem, SecurityAlertDetails, SubscriptionDetails } from "./types";

const appUrl = () => getAppUrl();

// ─── Account ────────────────────────────────────────────────────────────────

export function welcomeEmail(userName?: string, role: "student" | "teacher" = "student") {
  const name = displayName(userName);
  const dashboard = role === "teacher" ? `${appUrl()}/dashboard/teacher` : `${appUrl()}/dashboard/student`;
  const content = [
    emailHeading("Welcome to NextGrades!"),
    emailParagraph(`Hi ${name},`),
    emailParagraph(
      "We're thrilled to have you on board! You've joined a community of learners and educators passionate about growth and excellence."
    ),
    emailSubheading("What's waiting for you"),
    emailFeatureList([
      "<strong>Personalized learning paths</strong> tailored to your goals",
      "<strong>Interactive lessons & AI-powered quizzes</strong>",
      "<strong>Expert teacher support</strong> whenever you need help",
      "<strong>Progress tracking</strong> with detailed analytics",
    ]),
    emailButton(dashboard, "Go to Your Dashboard"),
    emailNotice("info", "<strong>Pro tip:</strong> Complete your profile to unlock personalized recommendations."),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Welcome to NextGrades — your learning journey starts here");
}

export { accountVerificationEmail as emailVerificationEmail } from "./templates/account-verification";

export function verificationCodeEmail(code: string, userName?: string, purpose = "verify your identity") {
  const name = displayName(userName);
  const content = [
    emailHeading("Your Verification Code"),
    emailParagraph(`Hi ${name},`),
    emailParagraph(`Use the code below to ${escapeHtml(purpose)}:`),
    emailCodeBlock(code),
    emailNotice("security", "<strong>Never share this code.</strong> NextGrades staff will never ask for it. This code expires in <strong>10 minutes</strong>."),
    emailSignature(),
  ].join("");
  return wrapEmail(content, `Your NextGrades verification code: ${code}`);
}

export function loginVerificationCodeEmail(code: string, userName?: string) {
  return verificationCodeEmail(code, userName, "complete your login");
}

export function passwordResetEmail(resetUrl: string, userName?: string) {
  const name = displayName(userName);
  const content = [
    emailHeading("Reset Your Password"),
    emailParagraph(`Hi ${name},`),
    emailParagraph("We received a request to reset your password. Click the button below to choose a new one:"),
    emailButton(resetUrl, "Reset Password"),
    emailNotice("security", "<strong>Security:</strong> This link expires in <strong>1 hour</strong>. If you didn't request this, ignore this email — your account remains secure."),
    emailSubheading("Or copy this link"),
    emailLinkBlock(resetUrl),
    emailButton(`${appUrl()}/contact`, "Contact Support", "secondary"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Reset your NextGrades password");
}

export function passwordChangedEmail(userName?: string, timestamp?: string) {
  const name = displayName(userName);
  const when = timestamp || new Date().toLocaleString("de-DE");
  const content = [
    emailHeading("Password Successfully Changed"),
    emailParagraph(`Hi ${name},`),
    emailParagraph("Your NextGrades account password was changed successfully."),
    emailDetailTable([
      { label: "Date & Time", value: escapeHtml(when) },
      { label: "Status", value: "✓ Confirmed" },
    ]),
    emailNotice("warning", "<strong>Didn't make this change?</strong> Reset your password immediately and contact our support team."),
    emailButton(`${appUrl()}/forgot-password`, "Secure My Account"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Your NextGrades password was changed");
}

// ─── Teacher ────────────────────────────────────────────────────────────────

export function teacherApprovedEmail(userName?: string) {
  const name = displayName(userName);
  const content = [
    emailHeading("Your Teacher Account Is Approved!"),
    emailParagraph(`Congratulations ${name}!`),
    emailParagraph("Your teacher application has been approved. You can now create courses, upload resources, and connect with students."),
    emailFeatureList([
      "Upload learning materials and resources",
      "Schedule lessons with students",
      "Use the AI quiz generator",
      "Track student progress and earnings",
    ]),
    emailButton(`${appUrl()}/dashboard/teacher`, "Open Teacher Dashboard"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Your NextGrades teacher account has been approved");
}

export function teacherRejectedEmail(userName?: string, reason?: string) {
  const name = displayName(userName);
  const content = [
    emailHeading("Teacher Application Update"),
    emailParagraph(`Hi ${name},`),
    emailParagraph("Thank you for your interest in teaching on NextGrades. After reviewing your application, we're unable to approve it at this time."),
    reason ? emailNotice("info", `<strong>Reason:</strong> ${escapeHtml(reason)}`) : "",
    emailParagraph("You're welcome to reapply in the future. If you have questions, our team is here to help."),
    emailButton(`${appUrl()}/contact`, "Contact Support"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Update on your NextGrades teacher application");
}

// ─── Enrollment & Commerce ──────────────────────────────────────────────────

export function enrollmentConfirmationEmail(
  userName: string | undefined,
  courseName: string,
  teacherName?: string
) {
  const name = displayName(userName);
  const content = [
    emailHeading("Enrollment Confirmed!"),
    emailParagraph(`Hi ${name},`),
    emailParagraph(`You are now enrolled in <strong>${escapeHtml(courseName)}</strong>.`),
    emailDetailTable([
      { label: "Course", value: escapeHtml(courseName) },
      ...(teacherName ? [{ label: "Teacher", value: escapeHtml(teacherName) }] : []),
      { label: "Status", value: "Active" },
    ]),
    emailButton(`${appUrl()}/dashboard/student/courses`, "View My Courses"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, `You're enrolled in ${courseName}`);
}

export function coursePurchaseEmail(
  userName: string | undefined,
  courseName: string,
  amount: number,
  currency = "EUR",
  receiptId?: string
) {
  const name = displayName(userName);
  const content = [
    emailHeading("Course Purchase Confirmed"),
    emailParagraph(`Hi ${name},`),
    emailParagraph("Thank you for your purchase! Your course is ready to access."),
    emailDetailTable([
      { label: "Course", value: escapeHtml(courseName) },
      { label: "Amount", value: formatCurrency(amount, currency) },
      ...(receiptId ? [{ label: "Receipt #", value: escapeHtml(receiptId) }] : []),
      { label: "Date", value: formatDate(new Date()) },
    ]),
    emailButton(`${appUrl()}/dashboard/student/courses`, "Start Learning"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, `Purchase confirmed: ${courseName}`);
}

export function subscriptionConfirmationEmail(userName: string | undefined, details: SubscriptionDetails) {
  const name = displayName(userName);
  const content = [
    emailHeading("Subscription Activated"),
    emailParagraph(`Hi ${name},`),
    emailParagraph("Your NextGrades subscription is now active. Enjoy full access to premium features!"),
    emailDetailTable([
      { label: "Plan", value: escapeHtml(details.planName) },
      { label: "Amount", value: escapeHtml(details.amount) },
      { label: "Billing", value: escapeHtml(details.billingCycle) },
      ...(details.renewalDate ? [{ label: "Next renewal", value: escapeHtml(details.renewalDate) }] : []),
    ]),
    emailButton(`${appUrl()}/dashboard/student`, "View Dashboard"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Your NextGrades subscription is active");
}

export function subscriptionRenewalReminderEmail(userName: string | undefined, details: SubscriptionDetails) {
  const name = displayName(userName);
  const content = [
    emailHeading("Subscription Renewal Reminder"),
    emailParagraph(`Hi ${name},`),
    emailParagraph(`Your <strong>${escapeHtml(details.planName)}</strong> subscription will renew soon.`),
    emailDetailTable([
      { label: "Plan", value: escapeHtml(details.planName) },
      { label: "Amount", value: escapeHtml(details.amount) },
      { label: "Renewal date", value: escapeHtml(details.renewalDate || "—") },
    ]),
    emailNotice("info", "No action needed — your payment method on file will be charged automatically."),
    emailButton(`${appUrl()}/dashboard/student/settings`, "Manage Subscription"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Your NextGrades subscription renews soon");
}

export function subscriptionExpiryEmail(userName: string | undefined, details: SubscriptionDetails) {
  const name = displayName(userName);
  const content = [
    emailHeading("Subscription Expiring Soon"),
    emailParagraph(`Hi ${name},`),
    emailParagraph(`Your <strong>${escapeHtml(details.planName)}</strong> subscription expires on <strong>${escapeHtml(details.expiryDate || "—")}</strong>.`),
    emailNotice("warning", "Renew now to keep access to premium courses, AI tools, and resources."),
    emailButton(`${appUrl()}/pricing`, "Renew Subscription"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Your NextGrades subscription is expiring");
}

export function paymentReceiptEmail(
  userName: string | undefined,
  items: PaymentLineItem[],
  total: string,
  receiptId?: string,
  invoiceUrl?: string
) {
  const name = displayName(userName);
  const content = [
    emailHeading("Payment Receipt"),
    emailParagraph(`Hi ${name},`),
    emailParagraph("Thank you for your payment. Here are your receipt details:"),
    emailDetailTable([
      ...items.map((i) => ({ label: i.label, value: i.value })),
      { label: "Total", value: `<strong>${escapeHtml(total)}</strong>` },
      ...(receiptId ? [{ label: "Receipt #", value: escapeHtml(receiptId) }] : []),
      { label: "Date", value: formatDate(new Date()) },
    ]),
    invoiceUrl ? emailButton(invoiceUrl, "Download Invoice") : "",
    emailNotice("info", "Keep this email for your records."),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Your NextGrades payment receipt");
}

// ─── Contact & Admin ────────────────────────────────────────────────────────

export function contactConfirmationEmail(userName: string, subject: string) {
  const name = displayName(userName);
  const content = [
    emailHeading("We Received Your Message"),
    emailParagraph(`Hi ${name},`),
    emailParagraph(`Thank you for contacting NextGrades regarding <strong>${escapeHtml(subject)}</strong>.`),
    emailParagraph("Our team will review your message and respond within <strong>1–2 business days</strong>."),
    emailNotice("info", "If your inquiry is urgent, reply to this email or visit our Help Center."),
    emailButton(`${appUrl()}/help`, "Visit Help Center"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "We received your message — NextGrades");
}

export function contactAdminEmail(
  name: string,
  email: string,
  message: string,
  subject: string,
  phone?: string
) {
  const content = [
    emailHeading("New Contact Form Submission"),
    emailDetailTable([
      { label: "Name", value: escapeHtml(name) },
      { label: "Email", value: `<a href="mailto:${escapeHtml(email)}" style="color:#D4AF37;">${escapeHtml(email)}</a>` },
      ...(phone ? [{ label: "Phone", value: escapeHtml(phone) }] : []),
      { label: "Subject", value: escapeHtml(subject) },
    ]),
    emailSubheading("Message"),
    emailParagraph(escapeHtml(message).replace(/\n/g, "<br />")),
    emailButton(`mailto:${email}`, "Reply to Sender", "secondary"),
  ].join("");
  return wrapEmail(content, `[Contact] ${subject}`);
}

export function adminNotificationEmail(title: string, message: string, actionUrl?: string, actionLabel = "View Details") {
  const content = [
    emailHeading(title),
    emailParagraph(message),
    actionUrl ? emailButton(actionUrl, actionLabel) : "",
    emailDivider(),
    emailParagraph(`<span style="font-size:13px;color:#718096;">This is an automated admin notification from NextGrades.</span>`),
  ].join("");
  return wrapEmail(content, title);
}

export function securityAlertEmail(userName: string | undefined, details: SecurityAlertDetails) {
  const name = displayName(userName);
  const rows = [
    { label: "Activity", value: escapeHtml(details.action) },
    ...(details.timestamp ? [{ label: "Time", value: escapeHtml(details.timestamp) }] : []),
    ...(details.ipAddress ? [{ label: "IP Address", value: escapeHtml(details.ipAddress) }] : []),
    ...(details.device ? [{ label: "Device", value: escapeHtml(details.device) }] : []),
    ...(details.location ? [{ label: "Location", value: escapeHtml(details.location) }] : []),
  ];
  const content = [
    emailHeading("Security Alert"),
    emailParagraph(`Hi ${name},`),
    emailParagraph("We detected activity on your NextGrades account:"),
    emailDetailTable(rows),
    emailNotice("warning", "<strong>Wasn't you?</strong> Secure your account immediately by changing your password."),
    emailButton(`${appUrl()}/forgot-password`, "Secure My Account"),
    emailButton(`${appUrl()}/contact`, "Report Suspicious Activity", "secondary"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Security alert for your NextGrades account");
}

// Legacy aliases
export { verificationCodeEmail as otpEmail };
export { notificationEmail } from "./templates/legacy-notification";
