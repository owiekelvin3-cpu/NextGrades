import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { I18nProvider } from "@/components/I18nProvider";
import { PreferencesSync } from "@/components/PreferencesSync";
import { PREFERENCES_BOOTSTRAP_SCRIPT } from "@/lib/preferences";
import { CmsProvider } from "@/context/CmsContext";
import { ToastProvider } from "@/context/ToastContext";
import PageTransition from "@/components/PageTransition";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NextGrades - Premium Lernplattform",
  description: "NextGrades ist eine moderne Premium-Lernplattform für Online-Nachhilfe, digitale Lernmaterialien und strukturierte Lernbegleitung.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${playfairDisplay.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: PREFERENCES_BOOTSTRAP_SCRIPT,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <I18nProvider>
            <PreferencesSync />
            <CmsProvider>
              <ToastProvider>
                <PageTransition>{children}</PageTransition>
              </ToastProvider>
            </CmsProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
