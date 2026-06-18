import { redirect } from "next/navigation";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const q = params.redirect ? `?redirect=${encodeURIComponent(params.redirect)}` : "";
  redirect(`/signup${q}`);
}
