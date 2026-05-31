import { redirect } from "next/navigation";
import { buildLoginUrl } from "@/lib/auth/redirect";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  redirect(buildLoginUrl(params.redirect ?? null, "signup"));
}
