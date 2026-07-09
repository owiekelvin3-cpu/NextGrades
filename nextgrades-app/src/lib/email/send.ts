import resend, { isResendConfigured } from "@/lib/resend";
import {
  getSenderFrom,
  getReplyToEmail,
  getAdminEmail,
} from "./config";
import type { SendEmailResult } from "./types";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  if (!isResendConfigured()) {
    console.warn("[email] RESEND_API_KEY not configured - skipping send:", options.subject);
    return { success: false, error: "Email service is not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getSenderFrom(),
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo || getReplyToEmail(),
      ...(options.text && { text: options.text }),
      ...(options.tags && { tags: options.tags }),
    });

    if (error) {
      console.error("[email] Resend error:", error);
      const msg = error.message || "Failed to send email";
      const sandboxHint =
        msg.toLowerCase().includes("only send") || msg.toLowerCase().includes("testing")
          ? " Resend test mode (onboarding@resend.dev) only delivers to your Resend account email until you verify a domain."
          : "";
      return { success: false, error: msg + sandboxHint };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    console.error("[email] Send failed:", message);
    return { success: false, error: message };
  }
}

export async function sendToAdmin(subject: string, html: string): Promise<SendEmailResult> {
  const adminEmail = getAdminEmail();
  if (!adminEmail) {
    return { success: false, error: "Admin email not configured" };
  }
  return sendEmail({ to: adminEmail, subject, html });
}

export { isResendConfigured };
