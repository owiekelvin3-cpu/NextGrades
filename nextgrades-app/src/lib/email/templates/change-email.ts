import { wrapEmail, emailHeading, emailParagraph, emailButton, emailNotice, emailSignature } from "../layout";
import { displayName, escapeHtml } from "../utils";

export function changeEmailEmail(confirmUrl: string, newEmail: string, userName?: string): string {
  const name = displayName(userName);
  const content = [
    emailHeading("Confirm Your New Email"),
    emailParagraph(`Hi ${name},`),
    emailParagraph(`Confirm your new email address: <strong>${escapeHtml(newEmail)}</strong>`),
    emailButton(confirmUrl, "Confirm New Email"),
    emailNotice("security", "If you didn't request this change, secure your account immediately."),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Confirm your new NextGrades email");
}

export default changeEmailEmail;
