import type { MetadataRoute } from "next";

function baseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  return url.replace(/\/$/, "");
}

const PUBLIC_PATHS = [
  "/",
  "/about",
  "/programs",
  "/subjects",
  "/pricing",
  "/resources",
  "/consultation",
  "/contact",
  "/help",
  "/careers",
  "/login",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const site = baseUrl();
  const now = new Date();

  return PUBLIC_PATHS.map((path) => ({
    url: `${site}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
