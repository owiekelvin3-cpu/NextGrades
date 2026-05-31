import { redirect } from "next/navigation";
import { buildLoginUrl } from "@/lib/auth/redirect";

/** Alias for /login — common "sign in" URL. */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const mode = params.mode === "signup" ? ("signup" as const) : undefined;
  redirect(buildLoginUrl(params.redirect ?? null, mode));
}
