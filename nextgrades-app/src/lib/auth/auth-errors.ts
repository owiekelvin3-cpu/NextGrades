/** Map Supabase Auth errors to user-friendly German messages. */

export function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials") || lower.includes("invalid credentials")) {
    return "E-Mail oder Passwort ist falsch. Bitte erneut versuchen.";
  }
  if (lower.includes("email not confirmed") || lower.includes("not confirmed")) {
    return "Bitte bestätige zuerst deine E-Mail-Adresse.";
  }
  if (lower.includes("too many requests") || lower.includes("rate limit")) {
    return "Zu viele Versuche. Bitte warte einen Moment und versuche es erneut.";
  }
  if (lower.includes("user not found")) {
    return "Kein Konto mit dieser E-Mail gefunden.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "Verbindungsfehler. Bitte prüfe deine Internetverbindung.";
  }
  return message;
}

export function isEmailNotConfirmedError(error: { message?: string; code?: string }): boolean {
  const msg = (error.message || "").toLowerCase();
  const code = (error.code || "").toLowerCase();
  return (
    code === "email_not_confirmed" ||
    msg.includes("email not confirmed") ||
    msg.includes("email_not_confirmed") ||
    msg.includes("not confirmed")
  );
}

export function isInvalidCredentialsError(error: { message?: string }): boolean {
  const msg = (error.message || "").toLowerCase();
  return msg.includes("invalid login credentials") || msg.includes("invalid credentials");
}
