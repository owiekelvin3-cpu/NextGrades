import { EMAIL_BRAND, getAppUrl } from "../config";
import {
  wrapEmail,
  emailHeading,
  emailParagraph,
  emailButton,
  emailNotice,
  emailLinkBlock,
  emailSignature,
  emailDivider,
  emailNumberedSteps,
} from "../layout";
import { halloLine, escapeHtml } from "../utils";

const C = EMAIL_BRAND.colors;

/**
 * Signup / email-confirmation message (Supabase link via Resend).
 * Content order: greet → why → steps → CTA → fallback link → security.
 */
export function accountVerificationEmail(verifyUrl: string, userName?: string) {
  const appUrl = getAppUrl();

  const content = [
    emailHeading("Bestätige deine E-Mail bei NextGrades"),
    emailParagraph(halloLine(userName)),
    emailParagraph(
      `vielen Dank für deine Registrierung bei <strong style="color:${C.navy};">NextGrades</strong>. ` +
        "Um dein Konto zu aktivieren und loszulegen, bestätige bitte deine E-Mail-Adresse - das dauert nur einen Klick."
    ),
    emailNumberedSteps([
      "Öffne dein Postfach (auch den Spam-Ordner bei Gmail).",
      "Klicke auf den goldenen Button <strong>„E-Mail bestätigen“</strong> in dieser Nachricht.",
      "Du wirst zu NextGrades weitergeleitet und kannst dich danach anmelden.",
    ]),
    emailButton(verifyUrl, "E-Mail bestätigen"),
    emailDivider(),
    emailParagraph(
      `<span style="font-size:13px;color:${C.textMuted};">Funktioniert der Button nicht? Kopiere diesen Link in deinen Browser:</span>`
    ),
    emailLinkBlock(verifyUrl),
    emailNotice(
      "security",
      "<strong>Sicherheit:</strong> Dieser Link ist <strong>24 Stunden</strong> gültig. NextGrades wird dich niemals nach deinem Passwort per E-Mail fragen. " +
        "Wenn du kein Konto erstellt hast, kannst du diese Nachricht ignorieren."
    ),
    emailParagraph(
      `<span style="font-size:13px;color:${C.textMuted};">Fragen? Schreib uns an <a href="${appUrl}/contact" style="color:${C.gold};text-decoration:none;">${escapeHtml(EMAIL_BRAND.supportEmail)}</a></span>`
    ),
    emailSignature(),
  ].join("");

  return wrapEmail(
    content,
    "NextGrades - Bitte bestätige deine E-Mail-Adresse, um dein Konto zu aktivieren."
  );
}

export function accountVerificationEmailPlain(verifyUrl: string, userName?: string): string {
  return [
    halloLine(userName),
    "",
    "Willkommen bei NextGrades! Bitte bestätige deine E-Mail-Adresse:",
    "",
    "1. Öffne dein Postfach (auch Spam bei Gmail).",
    "2. Klicke auf den Bestätigungslink unten.",
    "3. Melde dich danach auf NextGrades an.",
    "",
    verifyUrl,
    "",
    "Der Link ist 24 Stunden gültig. Wenn du kein Konto erstellt hast, ignoriere diese E-Mail.",
    "",
    `- ${EMAIL_BRAND.name}`,
    EMAIL_BRAND.supportEmail,
  ].join("\n");
}
