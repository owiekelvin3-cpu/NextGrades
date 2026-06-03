import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security/headers";

function supabaseImagePatterns(): { protocol: "https"; hostname: string }[] {
  const patterns: { protocol: "https"; hostname: string }[] = [
    { protocol: "https", hostname: "*.supabase.co" },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (supabaseUrl) {
    try {
      const hostname = new URL(supabaseUrl).hostname;
      if (hostname && !patterns.some((p) => p.hostname === hostname)) {
        patterns.unshift({ protocol: "https", hostname });
      }
    } catch {
      // ignore invalid URL
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  headers: securityHeaders(),
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [68, 70, 72, 75],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      ...supabaseImagePatterns(),
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@fortawesome/free-solid-svg-icons",
      "@fortawesome/free-brands-svg-icons",
      "@fortawesome/react-fontawesome",
      "@supabase/supabase-js",
      "@supabase/ssr",
      "react-i18next",
    ],
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
};

export default nextConfig;
