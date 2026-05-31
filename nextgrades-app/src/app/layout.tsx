import type { Metadata, Viewport } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { I18nProvider } from "@/components/I18nProvider";
import { PreferencesBootstrap } from "@/components/PreferencesBootstrap";
import { PreferencesSync } from "@/components/PreferencesSync";
import { PwaRegister } from "@/components/PwaRegister";
import { ToastProvider } from "@/context/ToastContext";
import { DeferredCmsProvider } from "@/components/DeferredCmsProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: true,
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? (() => {
      try {
        return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin;
      } catch {
        return null;
      }
    })()
  : null;

import { BRAND_LOGO } from "@/lib/brand";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "NextGrades - Premium Lernplattform",
  description:
    "NextGrades ist eine moderne Premium-Lernplattform für Online-Nachhilfe, digitale Lernmaterialien und strukturierte Lernbegleitung.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NextGrades",
  },
  icons: {
    icon: [
      { url: BRAND_LOGO.favicon, sizes: "32x32", type: "image/png" },
      { url: BRAND_LOGO.icon192, sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: BRAND_LOGO.appleTouch, sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0D1B2A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${poppins.variable} ${playfairDisplay.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {supabaseHost && (
          <>
            <link rel="preconnect" href={supabaseHost} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={supabaseHost} />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden bg-background text-foreground touch-manipulation">
        <PreferencesBootstrap />
        <ThemeProvider>
          <I18nProvider>
            <PreferencesSync />
            <PwaRegister />
            <DeferredCmsProvider>
              <ToastProvider>{children}</ToastProvider>
            </DeferredCmsProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
