import { redirect } from "next/navigation";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const q = new URLSearchParams();
  if (params.redirect) q.set("redirect", params.redirect);
  redirect(`/register${q.toString() ? `?${q}` : ""}`);
}
