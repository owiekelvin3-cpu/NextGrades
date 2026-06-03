/** NextGrades email brand & Resend configuration */

import { brandLogoUrl } from "@/lib/brand";
import { getAppUrl } from "@/lib/app-url";
import { COMPANY_ADDRESS_DEFAULT } from "@/lib/company";

export { getAppUrl };

export const EMAIL_BRAND = {
  name: "NextGrades",
  tagline: "Learn • Grow • Succeed",
  colors: {
    navy: "#0D1B2A",
    navyLight: "#112240",
    gold: "#D4AF37",
    goldDark: "#B8962E",
    white: "#FFFFFF",
    text: "#4A5568",
    textMuted: "#718096",
    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#4DA3FF",
  },
  supportEmail: process.env.SUPPORT_EMAIL || "support@nextgrades.de",
  companyAddress: process.env.COMPANY_ADDRESS || COMPANY_ADDRESS_DEFAULT,
} as const;

export function getSenderEmail(): string {
  return process.env.RESEND_SENDER_EMAIL || "onboarding@resend.dev";
}

export function getSenderName(): string {
  return process.env.RESEND_SENDER_NAME || "NextGrades";
}

export function getSenderFrom(): string {
  return `${getSenderName()} <${getSenderEmail()}>`;
}

export function getAdminEmail(): string {
  return (
    process.env.CONTACT_FORM_TO_EMAIL ||
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.RESEND_SENDER_EMAIL ||
    ""
  );
}

export function getReplyToEmail(): string {
  return process.env.RESEND_REPLY_TO_EMAIL || EMAIL_BRAND.supportEmail;
}

export function getLogoUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_EMAIL_LOGO_URL?.trim();
  if (url) return url;
  return brandLogoUrl(getAppUrl(), "light");
}
