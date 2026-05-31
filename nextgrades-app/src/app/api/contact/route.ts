import { NextResponse } from "next/server";
import { isResendConfigured, sendContactFormEmails } from "@/lib/email";
import { enforceRateLimit } from "@/lib/security/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, { bucket: "contact:submit", limit: 5, windowSec: 3600 });
  if (limited) return limited;

  try {
    if (!isResendConfigured()) {
      return NextResponse.json({ error: "Email service is not configured" }, { status: 503 });
    }

    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();
    const phone = body.phone ? String(body.phone).trim() : "";
    const subject = body.subject ? String(body.subject).trim() : "New contact form submission";

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (message.length > 5000) {
      return NextResponse.json({ error: "Message is too long" }, { status: 400 });
    }

    const results = await sendContactFormEmails(name, email, message, subject, phone || undefined);

    if (!results.admin.success) {
      return NextResponse.json({ error: results.admin.error || "Failed to send message" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Error sending contact email:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
