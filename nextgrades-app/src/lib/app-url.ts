/** Canonical public site URL - set NEXT_PUBLIC_APP_URL to your live domain before deploy. */
export function getAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  return (raw || "http://localhost:3000").replace(/\/$/, "");
}

export function isValidProductionAppUrl(url: string): boolean {
  if (!url.startsWith("https://")) return false;
  if (url.includes("localhost") || url.includes("127.0.0.1")) return false;
  return true;
}
