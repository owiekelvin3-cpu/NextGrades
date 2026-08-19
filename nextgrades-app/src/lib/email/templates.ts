/**
 * Centralized NextGrades email templates - all transactional emails in one place.
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
import { displayName, escapeHtml, formatCurrency, formatDate, halloLine } from "./utils";
import type { PaymentLineItem, SecurityAlertDetails, SubscriptionDetails } from "./types";

const appUrl = () => getAppUrl();

// ─── Account ────────────────────────────────────────────────────────────────

export function welcomeEmail(userName?: string, role: "student" | "teacher" = "student") {
  const dashboard = role === "teacher" ? `${appUrl()}/dashboard/teacher` : `${appUrl()}/dashboard/student`;
  const content = [
    emailHeading("Willkommen bei NextGrades!"),
    emailParagraph(halloLine(userName)),
    emailParagraph(
      "Schön, dass du dabei bist! Du bist Teil einer Community aus Lernenden und PädagogInnen, die Wachstum und Erfolg ernst nehmen."
    ),
    emailSubheading("Das erwartet dich"),
    emailFeatureList([
      "<strong>Individuelle Lernwege</strong> passend zu deinen Zielen",
      "<strong>Interaktive Lektionen & KI-gestützte Quizze</strong>",
      "<strong>Unterstützung durch erfahrene LehrerInnen</strong>, wenn du Hilfe brauchst",
      "<strong>Fortschrittsverfolgung</strong> mit klaren Einblicken",
    ]),
    emailButton(dashboard, "Zum Dashboard"),
    emailNotice("info", "<strong>Tipp:</strong> Vervollständige dein Profil für personalisierte Empfehlungen."),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Willkommen bei NextGrades - deine Lernreise beginnt jetzt");
}

export { accountVerificationEmail as emailVerificationEmail } from "./templates/account-verification";

export function verificationCodeEmail(code: string, userName?: string, purpose = "deine Identität zu bestätigen") {
  const content = [
    emailHeading("Dein Bestätigungscode"),
    emailParagraph(halloLine(userName)),
    emailParagraph(`Nutze den folgenden Code, um ${escapeHtml(purpose)}:`),
    emailCodeBlock(code),
    emailNotice("security", "<strong>Teile diesen Code niemals.</strong> NextGrades-Mitarbeitende fragen nie danach. Der Code läuft in <strong>10 Minuten</strong> ab."),
    emailSignature(),
  ].join("");
  return wrapEmail(content, `Dein NextGrades-Bestätigungscode: ${code}`);
}

export function loginVerificationCodeEmail(code: string, userName?: string) {
  return verificationCodeEmail(code, userName, "deine Anmeldung abzuschließen");
}

export function passwordResetEmail(resetUrl: string, userName?: string) {
  const content = [
    emailHeading("Passwort zurücksetzen"),
    emailParagraph(halloLine(userName)),
    emailParagraph("Wir haben eine Anfrage zum Zurücksetzen deines Passworts erhalten. Klicke auf den Button, um ein neues Passwort zu wählen:"),
    emailButton(resetUrl, "Neues Passwort festlegen"),
    emailNotice("security", "<strong>Sicherheit:</strong> Dieser Link ist <strong>1 Stunde</strong> gültig. Wenn du das nicht angefordert hast, ignoriere diese E-Mail – dein Konto bleibt sicher."),
    emailSubheading("Oder kopiere diesen Link"),
    emailLinkBlock(resetUrl),
    emailButton(`${appUrl()}/contact`, "Support kontaktieren", "secondary"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Setze dein NextGrades-Passwort zurück");
}

export function passwordChangedEmail(userName?: string, timestamp?: string) {
  const when = timestamp || new Date().toLocaleString("de-DE");
  const content = [
    emailHeading("Passwort erfolgreich geändert"),
    emailParagraph(halloLine(userName)),
    emailParagraph("Das Passwort deines NextGrades-Kontos wurde erfolgreich geändert."),
    emailDetailTable([
      { label: "Datum & Uhrzeit", value: escapeHtml(when) },
      { label: "Status", value: "✓ Bestätigt" },
    ]),
    emailNotice("warning", "<strong>Warst du das nicht?</strong> Setze dein Passwort sofort zurück und kontaktiere unseren Support."),
    emailButton(`${appUrl()}/forgot-password`, "Konto absichern"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Dein NextGrades-Passwort wurde geändert");
}

// ─── Teacher ────────────────────────────────────────────────────────────────

export function teacherApprovedEmail(userName?: string) {
  const name = displayName(userName);
  const content = [
    emailHeading("Dein Lehrkonto ist freigeschaltet!"),
    emailParagraph(name ? `Herzlichen Glückwunsch, ${name}!` : "Herzlichen Glückwunsch!"),
    emailParagraph("Deine Bewerbung als Lehrkraft wurde angenommen. Du kannst jetzt Kurse anlegen, Materialien hochladen und mit SchülerInnen arbeiten."),
    emailFeatureList([
      "Lernmaterialien und Ressourcen hochladen",
      "Stunden mit SchülerInnen planen",
      "Den KI-Quizgenerator nutzen",
      "Fortschritt und Honorare im Blick behalten",
    ]),
    emailButton(`${appUrl()}/dashboard/teacher`, "Zum Lehrer-Dashboard"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Dein NextGrades-Lehrkonto wurde freigeschaltet");
}

export function teacherRejectedEmail(userName?: string, reason?: string) {
  const content = [
    emailHeading("Update zu deiner Lehrkraft-Bewerbung"),
    emailParagraph(halloLine(userName)),
    emailParagraph("Danke für dein Interesse, bei NextGrades zu unterrichten. Nach Prüfung deiner Bewerbung können wir sie derzeit nicht annehmen."),
    reason ? emailNotice("info", `<strong>Begründung:</strong> ${escapeHtml(reason)}`) : "",
    emailParagraph("Du kannst dich später erneut bewerben. Bei Fragen hilft dir unser Team gerne weiter."),
    emailButton(`${appUrl()}/contact`, "Support kontaktieren"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Update zu deiner NextGrades-Lehrkraft-Bewerbung");
}

// ─── Enrollment & Commerce ──────────────────────────────────────────────────

export function enrollmentConfirmationEmail(
  userName: string | undefined,
  courseName: string,
  teacherName?: string
) {
  const content = [
    emailHeading("Anmeldung bestätigt!"),
    emailParagraph(halloLine(userName)),
    emailParagraph(`Du bist jetzt für <strong>${escapeHtml(courseName)}</strong> angemeldet.`),
    emailDetailTable([
      { label: "Kurs", value: escapeHtml(courseName) },
      ...(teacherName ? [{ label: "Lehrkraft", value: escapeHtml(teacherName) }] : []),
      { label: "Status", value: "Aktiv" },
    ]),
    emailButton(`${appUrl()}/dashboard/student/courses`, "Zu meinen Kursen"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, `Du bist angemeldet: ${courseName}`);
}

export function coursePurchaseEmail(
  userName: string | undefined,
  courseName: string,
  amount: number,
  currency = "EUR",
  receiptId?: string
) {
  const content = [
    emailHeading("Kauf bestätigt"),
    emailParagraph(halloLine(userName)),
    emailParagraph("Danke für deinen Kauf! Der Kurs steht dir jetzt zur Verfügung."),
    emailDetailTable([
      { label: "Kurs", value: escapeHtml(courseName) },
      { label: "Betrag", value: formatCurrency(amount, currency) },
      ...(receiptId ? [{ label: "Beleg-Nr.", value: escapeHtml(receiptId) }] : []),
      { label: "Datum", value: formatDate(new Date()) },
    ]),
    emailButton(`${appUrl()}/dashboard/student/courses`, "Jetzt lernen"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, `Kauf bestätigt: ${courseName}`);
}

export function subscriptionConfirmationEmail(userName: string | undefined, details: SubscriptionDetails) {
  const content = [
    emailHeading("Abo aktiviert"),
    emailParagraph(halloLine(userName)),
    emailParagraph("Dein NextGrades-Abo ist jetzt aktiv. Du hast vollen Zugang zu den Premium-Funktionen."),
    emailDetailTable([
      { label: "Tarif", value: escapeHtml(details.planName) },
      { label: "Betrag", value: escapeHtml(details.amount) },
      { label: "Abrechnung", value: escapeHtml(details.billingCycle) },
      ...(details.renewalDate ? [{ label: "Nächste Verlängerung", value: escapeHtml(details.renewalDate) }] : []),
    ]),
    emailButton(`${appUrl()}/dashboard/student`, "Zum Dashboard"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Dein NextGrades-Abo ist aktiv");
}

export function subscriptionRenewalReminderEmail(userName: string | undefined, details: SubscriptionDetails) {
  const content = [
    emailHeading("Erinnerung: Abo-Verlängerung"),
    emailParagraph(halloLine(userName)),
    emailParagraph(`Dein Abo <strong>${escapeHtml(details.planName)}</strong> wird in Kürze verlängert.`),
    emailDetailTable([
      { label: "Tarif", value: escapeHtml(details.planName) },
      { label: "Betrag", value: escapeHtml(details.amount) },
      { label: "Verlängerung am", value: escapeHtml(details.renewalDate || "-") },
    ]),
    emailNotice("info", "Du musst nichts tun – die hinterlegte Zahlungsmethode wird automatisch belastet."),
    emailButton(`${appUrl()}/dashboard/student/settings`, "Abo verwalten"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Dein NextGrades-Abo wird bald verlängert");
}

export function subscriptionExpiryEmail(userName: string | undefined, details: SubscriptionDetails) {
  const content = [
    emailHeading("Abo läuft bald ab"),
    emailParagraph(halloLine(userName)),
    emailParagraph(`Dein Abo <strong>${escapeHtml(details.planName)}</strong> endet am <strong>${escapeHtml(details.expiryDate || "-")}</strong>.`),
    emailNotice("warning", "Verlängere jetzt, um Zugang zu Premium-Kursen, KI-Tools und Materialien zu behalten."),
    emailButton(`${appUrl()}/pricing`, "Abo verlängern"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Dein NextGrades-Abo läuft bald ab");
}

export function paymentReceiptEmail(
  userName: string | undefined,
  items: PaymentLineItem[],
  total: string,
  receiptId?: string,
  invoiceUrl?: string
) {
  const content = [
    emailHeading("Zahlungsbeleg"),
    emailParagraph(halloLine(userName)),
    emailParagraph("Danke für deine Zahlung. Hier sind die Belegdetails:"),
    emailDetailTable([
      ...items.map((i) => ({ label: i.label, value: i.value })),
      { label: "Gesamt", value: `<strong>${escapeHtml(total)}</strong>` },
      ...(receiptId ? [{ label: "Beleg-Nr.", value: escapeHtml(receiptId) }] : []),
      { label: "Datum", value: formatDate(new Date()) },
    ]),
    invoiceUrl ? emailButton(invoiceUrl, "Rechnung herunterladen") : "",
    emailNotice("info", "Bitte bewahre diese E-Mail für deine Unterlagen auf."),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Dein NextGrades-Zahlungsbeleg");
}

// ─── Contact & Admin ────────────────────────────────────────────────────────

export function contactConfirmationEmail(userName: string, subject: string) {
  const content = [
    emailHeading("Wir haben deine Nachricht erhalten"),
    emailParagraph(halloLine(userName)),
    emailParagraph(`Danke, dass du NextGrades zum Thema <strong>${escapeHtml(subject)}</strong> kontaktiert hast.`),
    emailParagraph("Unser Team prüft deine Nachricht und antwortet innerhalb von <strong>1–2 Werktagen</strong>."),
    emailNotice("info", "Bei dringenden Anliegen antworte auf diese E-Mail oder besuche unser Hilfe-Center."),
    emailButton(`${appUrl()}/help`, "Zum Hilfe-Center"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Wir haben deine Nachricht erhalten – NextGrades");
}

export function contactAdminEmail(
  name: string,
  email: string,
  message: string,
  subject: string,
  phone?: string
) {
  const content = [
    emailHeading("Neue Kontaktanfrage"),
    emailDetailTable([
      { label: "Name", value: escapeHtml(name) },
      { label: "E-Mail", value: `<a href="mailto:${escapeHtml(email)}" style="color:#D4AF37;">${escapeHtml(email)}</a>` },
      ...(phone ? [{ label: "Telefon", value: escapeHtml(phone) }] : []),
      { label: "Betreff", value: escapeHtml(subject) },
    ]),
    emailSubheading("Nachricht"),
    emailParagraph(escapeHtml(message).replace(/\n/g, "<br />")),
    emailButton(`mailto:${email}`, "Absender antworten", "secondary"),
  ].join("");
  return wrapEmail(content, `[Kontakt] ${subject}`);
}

export function guestAccountSetupAdminEmail(details: {
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
  const fullName = `${details.firstName} ${details.lastName}`.trim();
  const content = [
    emailHeading("Neue bezahlte Anmeldung – Konto anlegen"),
    emailParagraph(
      "Eine Kundin oder ein Kunde hat bezahlt und die Daten übermittelt. Bitte das NextGrades-Konto anlegen und den Zugang freischalten."
    ),
    emailDetailTable([
      { label: "SchülerIn", value: escapeHtml(fullName) },
      { label: "Kontakt-E-Mail", value: `<a href="mailto:${escapeHtml(details.email)}" style="color:#D4AF37;">${escapeHtml(details.email)}</a>` },
      ...(details.paymentEmail && details.paymentEmail !== details.email
        ? [{ label: "Stripe-Zahlungs-E-Mail", value: escapeHtml(details.paymentEmail) }]
        : []),
      ...(details.phone ? [{ label: "Telefon", value: escapeHtml(details.phone) }] : []),
      ...(details.parentName ? [{ label: "Eltern / Erziehungsberechtigte", value: escapeHtml(details.parentName) }] : []),
      ...(details.planName ? [{ label: "Tarif", value: escapeHtml(details.planName) }] : []),
      ...(details.subjectName ? [{ label: "Fach", value: escapeHtml(details.subjectName) }] : []),
      ...(details.grade ? [{ label: "Schulstufe", value: escapeHtml(details.grade) }] : []),
      ...(details.semester ? [{ label: "Semester", value: escapeHtml(details.semester) }] : []),
      { label: "Stripe-Sitzung", value: escapeHtml(details.stripeSessionId) },
    ]),
    ...(details.notes
      ? [emailSubheading("Zusätzliche Hinweise"), emailParagraph(escapeHtml(details.notes).replace(/\n/g, "<br />"))]
      : []),
    emailButton(`mailto:${details.email}`, "KundIn antworten", "secondary"),
  ].join("");
  return wrapEmail(content, "[NextGrades] Bezahlte Anmeldung – Konto anlegen");
}

export function guestAccountSetupConfirmationEmail(firstName: string, subjectName?: string) {
  const content = [
    emailHeading("Zahlung erhalten – wir richten dein Konto ein"),
    emailParagraph(halloLine(firstName)),
    emailParagraph(
      "Danke für deine Zahlung. Wir haben deine Angaben erhalten und das NextGrades-Team legt dein Konto in Kürze an."
    ),
    ...(subjectName
      ? [emailParagraph(`<strong>Fach:</strong> ${escapeHtml(subjectName)}`)]
      : []),
    emailNotice(
      "info",
      "Du erhältst eine weitere E-Mail, sobald deine Zugangsdaten bereitstehen. Bei Fragen antworte auf diese Nachricht oder kontaktiere den Support."
    ),
    emailButton(`${appUrl()}/contact`, "Support kontaktieren", "secondary"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "NextGrades – wir richten dein Konto ein");
}

export function adminNotificationEmail(title: string, message: string, actionUrl?: string, actionLabel = "Details ansehen") {
  const content = [
    emailHeading(title),
    emailParagraph(message),
    actionUrl ? emailButton(actionUrl, actionLabel) : "",
    emailDivider(),
    emailParagraph(`<span style="font-size:13px;color:#718096;">Automatische Admin-Benachrichtigung von NextGrades.</span>`),
  ].join("");
  return wrapEmail(content, title);
}

export function securityAlertEmail(userName: string | undefined, details: SecurityAlertDetails) {
  const rows = [
    { label: "Aktivität", value: escapeHtml(details.action) },
    ...(details.timestamp ? [{ label: "Uhrzeit", value: escapeHtml(details.timestamp) }] : []),
    ...(details.ipAddress ? [{ label: "IP-Adresse", value: escapeHtml(details.ipAddress) }] : []),
    ...(details.device ? [{ label: "Gerät", value: escapeHtml(details.device) }] : []),
    ...(details.location ? [{ label: "Ort", value: escapeHtml(details.location) }] : []),
  ];
  const content = [
    emailHeading("Sicherheitshinweis"),
    emailParagraph(halloLine(userName)),
    emailParagraph("Wir haben folgende Aktivität in deinem NextGrades-Konto festgestellt:"),
    emailDetailTable(rows),
    emailNotice("warning", "<strong>Warst du das nicht?</strong> Sichere dein Konto sofort, indem du dein Passwort änderst."),
    emailButton(`${appUrl()}/forgot-password`, "Konto absichern"),
    emailButton(`${appUrl()}/contact`, "Verdächtige Aktivität melden", "secondary"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Sicherheitshinweis zu deinem NextGrades-Konto");
}

// Legacy aliases
export { verificationCodeEmail as otpEmail };
export { notificationEmail } from "./templates/legacy-notification";
