import { wrapEmail, emailHeading, emailParagraph, emailButton, emailSignature, emailSubheading } from "../layout";
import { escapeHtml, displayName } from "../utils";

export function lessonInvitationEmail(params: {
  userName?: string;
  teacherName?: string;
  className: string;
  whenLabel: string;
  joinUrl?: string;
  appointmentsUrl: string;
}): string {
  const name = displayName(params.userName, "du");
  const teacher = params.teacherName?.trim() || "deine Lehrkraft";
  const hasLink = Boolean(params.joinUrl?.trim());

  const content = [
    emailHeading("Einladung zur Nachhilfestunde"),
    emailParagraph(`Hallo ${escapeHtml(name)},`),
    emailParagraph(
      `<strong>${escapeHtml(teacher)}</strong> hat eine Stunde für dich eingetragen:`
    ),
    emailSubheading(params.className),
    emailParagraph(`<strong>Termin:</strong> ${escapeHtml(params.whenLabel)}`),
    hasLink
      ? [
          emailParagraph("Mit diesem Link kannst du dem Video-Meeting beitreten:"),
          emailButton(params.joinUrl!, "Video-Meeting beitreten"),
          emailParagraph(
            `Oder öffne deine Termine im Portal: <a href="${escapeHtml(params.appointmentsUrl)}" style="color:#D4AF37;">Meine Termine</a>`
          ),
        ].join("")
      : emailParagraph(
          `Der Video-Link folgt noch. Bis dahin findest du den Termin unter <a href="${escapeHtml(params.appointmentsUrl)}" style="color:#D4AF37;">Meine Termine</a>.`
        ),
    emailParagraph("Bitte sei pünktlich und teste den Link vorab."),
    emailSignature(),
  ].join("");

  return wrapEmail(content, "Einladung zur NextGrades-Stunde");
}

export function lessonInvitationEmailPlain(params: {
  userName?: string;
  teacherName?: string;
  className: string;
  whenLabel: string;
  joinUrl?: string;
  appointmentsUrl: string;
}): string {
  const name = displayName(params.userName, "du");
  const teacher = params.teacherName?.trim() || "deine Lehrkraft";
  return [
    `Hallo ${name},`,
    "",
    `${teacher} hat eine Stunde für dich eingetragen: ${params.className}`,
    `Termin: ${params.whenLabel}`,
    "",
    params.joinUrl ? `Video-Link: ${params.joinUrl}` : "Der Video-Link folgt noch.",
    `Termine im Portal: ${params.appointmentsUrl}`,
    "",
    "NextGrades",
  ].join("\n");
}
