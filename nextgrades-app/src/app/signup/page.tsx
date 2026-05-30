import { redirect } from "next/navigation";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const q = new URLSearchParams({ mode: "signup" });
  if (params.redirect) q.set("redirect", params.redirect);
  redirect(`/login?${q.toString()}`);
}
