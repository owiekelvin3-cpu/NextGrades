import { wrapEmail, emailHeading, emailParagraph, emailButton, emailSignature, emailSubheading } from "../layout";
import { escapeHtml, displayName } from "../utils";

export function accountInvitationEmail(params: {
  userName?: string;
  role: "student" | "teacher" | "admin";
  setupUrl: string;
}): string {
  const name = displayName(params.userName, "du");
  const roleLabel =
    params.role === "teacher" ? "Lehrkraft" : params.role === "admin" ? "Administrator" : "SchülerIn";

  const content = [
    emailHeading("Willkommen bei NextGrades"),
    emailParagraph(`Hallo ${escapeHtml(name)},`),
    emailParagraph(
      `Ein Administrator hat ein <strong>${roleLabel}</strong>-Konto für dich erstellt. Lege jetzt dein persönliches Passwort fest, um dich anzumelden.`
    ),
    emailSubheading("Nächster Schritt"),
    emailParagraph(
      "Klicke auf den Button unten, um ein sicheres Passwort zu wählen. Der Link ist aus Sicherheitsgründen nur begrenzt gültig."
    ),
    emailButton(params.setupUrl, "Passwort festlegen"),
    emailParagraph(
      "Falls du diese Einladung nicht erwartet hast, kannst du diese E-Mail ignorieren oder uns unter support@nextgrades.at kontaktieren."
    ),
    emailSignature(),
  ].join("");

  return wrapEmail(content, "Deine NextGrades Einladung");
}

export function accountInvitationEmailPlain(params: {
  userName?: string;
  role: "student" | "teacher" | "admin";
  setupUrl: string;
}): string {
  const name = displayName(params.userName, "du");
  return [
    `Hallo ${name},`,
    "",
    "Dein NextGrades Konto wurde erstellt.",
    "",
    "Lege dein Passwort über diesen Link fest:",
    params.setupUrl,
    "",
    "NextGrades",
  ].join("\n");
}
