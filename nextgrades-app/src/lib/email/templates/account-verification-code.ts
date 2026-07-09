import { EMAIL_BRAND } from "../config";
import {
  wrapEmail,
  emailHeading,
  emailParagraph,
  emailNotice,
  emailSignature,
  emailNumberedSteps,
  emailCodeBlock,
} from "../layout";
import { displayName, escapeHtml } from "../utils";

const C = EMAIL_BRAND.colors;

export function accountVerificationCodeEmail(code: string, userName?: string) {
  const name = displayName(userName);

  const content = [
    emailHeading("Dein Bestätigungscode"),
    emailParagraph(`Hallo ${name},`),
    emailParagraph(
      `vielen Dank für deine Registrierung bei <strong style="color:${C.navy};">NextGrades</strong>. ` +
        "Gib den folgenden Code auf der Website ein, um dein Konto zu aktivieren:"
    ),
    emailCodeBlock(code),
    emailNumberedSteps([
      "Öffne dein Postfach (auch den Spam-Ordner bei Gmail).",
      "Kopiere den <strong>6-stelligen Code</strong> aus dieser Nachricht.",
      "Gib den Code auf NextGrades ein und melde dich danach an.",
    ]),
    emailNotice(
      "security",
      "<strong>Sicherheit:</strong> Der Code ist <strong>10 Minuten</strong> gültig. Teile ihn mit niemandem - NextGrades wird dich niemals danach fragen. " +
        "Wenn du kein Konto erstellt hast, kannst du diese Nachricht ignorieren."
    ),
    emailSignature(),
  ].join("");

  return wrapEmail(
    content,
    `NextGrades - Dein Bestätigungscode: ${escapeHtml(code)}`
  );
}

export function accountVerificationCodeEmailPlain(code: string, userName?: string): string {
  const name = displayName(userName);
  return [
    `Hallo ${name},`,
    "",
    "Willkommen bei NextGrades! Dein Bestätigungscode:",
    "",
    code,
    "",
    "1. Öffne dein Postfach (auch Spam bei Gmail).",
    "2. Gib diesen 6-stelligen Code auf NextGrades ein.",
    "3. Melde dich danach an.",
    "",
    "Der Code ist 10 Minuten gültig. Wenn du kein Konto erstellt hast, ignoriere diese E-Mail.",
    "",
    `- ${EMAIL_BRAND.name}`,
    EMAIL_BRAND.supportEmail,
  ].join("\n");
}
