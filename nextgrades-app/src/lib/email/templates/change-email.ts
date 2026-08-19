import { wrapEmail, emailHeading, emailParagraph, emailButton, emailNotice, emailSignature } from "../layout";
import { escapeHtml, halloLine } from "../utils";

export function changeEmailEmail(confirmUrl: string, newEmail: string, userName?: string): string {
  const content = [
    emailHeading("Neue E-Mail-Adresse bestätigen"),
    emailParagraph(halloLine(userName)),
    emailParagraph(`Bitte bestätige deine neue E-Mail-Adresse: <strong>${escapeHtml(newEmail)}</strong>`),
    emailButton(confirmUrl, "Neue E-Mail bestätigen"),
    emailNotice("security", "Wenn du diese Änderung nicht angefordert hast, sichere dein Konto sofort."),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Bestätige deine neue NextGrades-E-Mail");
}

export default changeEmailEmail;
