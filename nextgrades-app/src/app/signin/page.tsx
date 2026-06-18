import { redirect } from "next/navigation";
import { buildLoginUrl } from "@/lib/auth/redirect";

/** Alias for /login — no public signup mode. */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; mode?: string }>;
}) {
  const params = await searchParams;
  redirect(buildLoginUrl(params.redirect ?? null));
}
