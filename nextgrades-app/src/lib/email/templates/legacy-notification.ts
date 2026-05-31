/** Legacy notification template — re-exported for backward compatibility */
import {
  wrapEmail,
  emailHeading,
  emailParagraph,
  emailButton,
  emailSignature,
} from "../layout";
import { displayName } from "../utils";
import { getAppUrl } from "../config";

export function notificationEmail(
  title: string,
  message: string,
  ctaText?: string,
  ctaUrl?: string,
  userName?: string
): string {
  const name = displayName(userName);
  const content = [
    emailHeading(title),
    emailParagraph(`Hi ${name},`),
    emailParagraph(message),
    ctaText && ctaUrl ? emailButton(ctaUrl, ctaText) : "",
    emailSignature(),
  ].join("");
  return wrapEmail(content, title);
}

export default notificationEmail;
