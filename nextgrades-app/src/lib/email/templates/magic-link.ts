import { wrapEmail, emailHeading, emailParagraph, emailButton, emailSignature } from "../layout";
import { displayName } from "../utils";
import { getAppUrl } from "../config";

export function magicLinkEmail(loginUrl: string, userName?: string): string {
  const name = displayName(userName);
  const content = [
    emailHeading("Your Magic Login Link"),
    emailParagraph(`Hi ${name},`),
    emailParagraph("Click below to sign in to NextGrades instantly:"),
    emailButton(loginUrl, "Sign In to NextGrades"),
    emailSignature(),
  ].join("");
  return wrapEmail(content, "Your NextGrades magic login link");
}

export default magicLinkEmail;
