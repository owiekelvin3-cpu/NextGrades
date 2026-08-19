import { wrapEmail, emailHeading, emailParagraph, emailButton, emailSignature } from "../layout";
import { escapeHtml } from "../utils";
import { getAppUrl } from "../config";

export function inviteEmail(
  acceptUrl: string,
  inviterName: string,
  inviteMessage?: string,
  role: "student" | "teacher" = "student"
): string {
  const roleLabel = role === "teacher" ? "Lehrkraft" : "SchülerIn";
  const content = [
    emailHeading("Du bist zu NextGrades eingeladen"),
    emailParagraph(`<strong>${escapeHtml(inviterName)}</strong> hat dich eingeladen, NextGrades als ${roleLabel} zu nutzen.`),
    inviteMessage ? emailParagraph(escapeHtml(inviteMessage)) : "",
    emailButton(acceptUrl, "Einladung annehmen"),
    emailParagraph(`Oder besuche <a href="${getAppUrl()}" style="color:#D4AF37;">${getAppUrl()}</a>, um mehr zu erfahren.`),
    emailSignature(),
  ].join("");
  return wrapEmail(content, `${inviterName} hat dich zu NextGrades eingeladen`);
}

export default inviteEmail;
