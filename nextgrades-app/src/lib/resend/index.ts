import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY?.trim();

if (!apiKey) {
  console.warn("RESEND_API_KEY is not set — email sending will fail.");
}

const resend = new Resend(apiKey || "missing_resend_api_key");

export default resend;

export function isResendConfigured(): boolean {
  return Boolean(apiKey);
}
