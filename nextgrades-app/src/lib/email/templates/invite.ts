import { wrapEmail, emailHeading, emailParagraph, emailButton, emailSignature } from "../layout";
import { displayName, escapeHtml } from "../utils";
import { getAppUrl } from "../config";

export function inviteEmail(
  acceptUrl: string,
  inviterName: string,
  inviteMessage?: string,
  role: "student" | "teacher" = "student"
): string {
  const content = [
    emailHeading("You're Invited to NextGrades"),
    emailParagraph(`<strong>${escapeHtml(inviterName)}</strong> invited you to join NextGrades as a ${role}.`),
    inviteMessage ? emailParagraph(escapeHtml(inviteMessage)) : "",
    emailButton(acceptUrl, "Accept Invitation"),
    emailParagraph(`Or visit <a href="${getAppUrl()}" style="color:#D4AF37;">${getAppUrl()}</a> to learn more.`),
    emailSignature(),
  ].join("");
  return wrapEmail(content, `${inviterName} invited you to NextGrades`);
}

export default inviteEmail;
