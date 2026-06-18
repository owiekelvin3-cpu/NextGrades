/** Protect operational endpoints (health diagnostics) in production. */
export function isOpsAuthorized(request: Request): boolean {
  const token = process.env.HEALTH_OPS_TOKEN?.trim();
  if (!token) return process.env.NODE_ENV !== "production";

  const header = request.headers.get("x-ops-token")?.trim();
  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  return header === token || bearer === token;
}
