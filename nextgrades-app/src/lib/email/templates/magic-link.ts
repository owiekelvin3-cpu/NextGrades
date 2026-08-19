import { wrapEmail, emailHeading, emailParagraph, emailButton, emailSignature } from "../layout";
import { halloLine } from "../utils";

export function magicLinkEmail(loginUrl: string, userName?: string): string {
  const content = [
    emailHeading("Dein Anmeldelink"),
    emailParagraph(halloLine(userName)),
    emailParagraph("Klicke unten, um dich sofort bei NextGrades anzumelden:"),
    emailButton(loginUrl, "Bei NextGrades anmelden"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Dein NextGrades-Anmeldelink");
}

export default magicLinkEmail;
