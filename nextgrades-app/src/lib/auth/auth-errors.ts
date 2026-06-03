/** Map Supabase Auth errors to user-friendly messages. */

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
