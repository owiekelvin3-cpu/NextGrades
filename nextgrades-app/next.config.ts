import type { NextConfig } from "next";

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
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      ...supabaseImagePatterns(),
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@fortawesome/free-solid-svg-icons",
      "@fortawesome/free-brands-svg-icons",
      "@fortawesome/react-fontawesome",
    ],
  },
};

export default nextConfig;
