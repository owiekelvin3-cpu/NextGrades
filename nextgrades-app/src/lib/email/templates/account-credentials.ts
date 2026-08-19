import { wrapEmail, emailHeading, emailParagraph, emailButton, emailSignature, emailSubheading } from "../layout";
import { escapeHtml, displayName } from "../utils";
import { getAppUrl } from "../config";

export function accountCredentialsEmail(params: {
  email: string;
  password: string;
  userName?: string;
  role: "student" | "teacher" | "admin";
  loginUrl: string;
}): string {
  const name = displayName(params.userName, "du");
  const roleLabel =
    params.role === "teacher" ? "Lehrkraft" : params.role === "admin" ? "Administrator" : "SchülerIn";

  const content = [
    emailHeading("Dein NextGrades Konto"),
    emailParagraph(`Hallo ${escapeHtml(name)},`),
    emailParagraph(
      `Ein Administrator hat ein <strong>${roleLabel}</strong>-Konto für dich erstellt. Hier sind deine Zugangsdaten:`
    ),
    emailSubheading("Anmeldedaten"),
    emailParagraph(
      `<strong>E-Mail:</strong> ${escapeHtml(params.email)}<br/><strong>Passwort:</strong> ${escapeHtml(params.password)}`
    ),
    emailParagraph(
      "Aus Sicherheitsgründen empfehlen wir, dein Passwort nach der ersten Anmeldung zu ändern."
    ),
    emailButton(params.loginUrl, "Jetzt anmelden"),
    emailParagraph(
      `Oder besuche <a href="${getAppUrl()}" style="color:#D4AF37;">${escapeHtml(getAppUrl())}</a> und melde dich mit den Daten oben an.`
    ),
    emailSignature(),
  ].join("");

  return wrapEmail(content, "Deine NextGrades Zugangsdaten");
}

export function accountCredentialsEmailPlain(params: {
  email: string;
  password: string;
  userName?: string;
  role: "student" | "teacher" | "admin";
  loginUrl: string;
}): string {
  const name = displayName(params.userName, "du");
  return [
    `Hallo ${name},`,
    "",
    "Dein NextGrades Konto wurde erstellt.",
    "",
    `E-Mail: ${params.email}`,
    `Passwort: ${params.password}`,
    "",
    `Anmelden: ${params.loginUrl}`,
    "",
    "Bitte ändere dein Passwort nach der ersten Anmeldung.",
    "",
    "NextGrades",
  ].join("\n");
}
