import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

/** Security headers applied to all routes via next.config.ts */
export function securityHeaders(): NonNullable<NextConfig["headers"]> {
  const headers: { key: string; value: string }[] = [
    /** SAMEORIGIN allows the CMS live-preview iframe (same site); blocks external embeds. */
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    },
    { key: "X-DNS-Prefetch-Control", value: "on" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  ];

  if (isProduction) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });

    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.stripe.com https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https: *.supabase.co",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://challenges.cloudflare.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join("; ");

    headers.push({ key: "Content-Security-Policy", value: csp });
  }

  const staticCache: { key: string; value: string }[] = [
    { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
  ];

  return async () => [
    {
      source: "/(.*)",
      headers,
    },
    /** Long-cache public images (img-*, team, logos, etc.) — extension match avoids invalid :param patterns */
    {
      source: "/:path*\\.(png|jpg|jpeg|webp|avif|ico|svg)",
      headers: staticCache,
    },
  ];
}
