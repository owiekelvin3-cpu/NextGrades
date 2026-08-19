/** Legacy notification template - re-exported for backward compatibility */
import {
  wrapEmail,
  emailHeading,
  emailParagraph,
  emailButton,
  emailSignature,
} from "../layout";
import { halloLine } from "../utils";

export function notificationEmail(
  title: string,
  message: string,
  ctaText?: string,
  ctaUrl?: string,
  userName?: string
): string {
  const content = [
    emailHeading(title),
    emailParagraph(halloLine(userName)),
    emailParagraph(message),
    ctaText && ctaUrl ? emailButton(ctaUrl, ctaText) : "",
    emailSignature(),
  ].join("");
  return wrapEmail(content, title);
}

export default notificationEmail;
