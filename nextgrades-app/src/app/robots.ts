import type { MetadataRoute } from "next";

function baseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  return url.replace(/\/$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const site = baseUrl();
  const isLocal = site.includes("localhost") || site.includes("127.0.0.1");

  return {
    rules: isLocal
      ? { userAgent: "*", disallow: "/" }
      : {
          userAgent: "*",
          allow: "/",
          disallow: [
            "/dashboard/",
            "/portal/",
            "/admin/",
            "/admin-access",
            "/api/",
            "/auth/",
            "/checkout",
            "/choose-role",
          ],
        },
    sitemap: `${site}/sitemap.xml`,
  };
}
