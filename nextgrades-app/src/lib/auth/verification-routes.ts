import type { NextRequest } from "next/server";

export type VerificationStep = "signup" | "login";

export function buildServerVerifyPath(
  step: VerificationStep,
  opts?: { email?: string | null; redirect?: string | null }
): string {
  const params = new URLSearchParams({ step });
  if (opts?.email) params.set("email", opts.email);
  if (opts?.redirect) params.set("redirect", opts.redirect);
  return `/verify?${params.toString()}`;
}

export function redirectToVerification(
  request: NextRequest,
  step: VerificationStep,
  opts?: { email?: string | null; redirect?: string | null }
) {
  const url = request.nextUrl.clone();
  url.pathname = "/verify";
  url.search = "";
  url.searchParams.set("step", step);
  if (opts?.email) url.searchParams.set("email", opts.email);
  if (opts?.redirect) url.searchParams.set("redirect", opts.redirect);
  return url;
}

export function isVerificationPath(path: string): boolean {
  return path === "/verify" || path.startsWith("/verify/");
}
