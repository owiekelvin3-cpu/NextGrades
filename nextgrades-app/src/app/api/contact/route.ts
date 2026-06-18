import { NextResponse } from "next/server";
import { isResendConfigured, sendContactFormEmails } from "@/lib/email";
import { enforceRateLimit } from "@/lib/security/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, { bucket: "contact:submit", limit: 5, windowSec: 3600 });
  if (limited) return limited;

  try {
    if (!isResendConfigured()) {
      return NextResponse.json({ error: "E-Mail-Dienst ist nicht konfiguriert." }, { status: 503 });
    }

    const body = await request.json();
    const name = String(body.name || body.firstName || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();
    const phone = body.phone ? String(body.phone).trim() : "";
    const lastName = body.lastName ? String(body.lastName).trim() : "";
    const fullName = [name, lastName].filter(Boolean).join(" ").trim();
    const subject = body.subject ? String(body.subject).trim() : "Neue Kontaktanfrage";

    if (!fullName || !email || !message) {
      return NextResponse.json(
        { error: "Vorname, E-Mail und Nachricht sind Pflichtfelder." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Bitte gib eine gültige E-Mail-Adresse ein." }, { status: 400 });
    }

    if (message.length > 5000) {
      return NextResponse.json({ error: "Die Nachricht ist zu lang." }, { status: 400 });
    }

    const results = await sendContactFormEmails(fullName, email, message, subject, phone || undefined);

    if (!results.admin.success) {
      return NextResponse.json(
        { error: results.admin.error || "Nachricht konnte nicht gesendet werden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Error sending contact email:", error);
    return NextResponse.json({ error: "Nachricht konnte nicht gesendet werden." }, { status: 500 });
  }
}
