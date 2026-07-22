"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { syncPreferencesAfterAuth } from "@/lib/preferences";
import { changeAppLanguage } from "@/components/I18nProvider";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/Button";
import { fetchProfileRole, resolvePostAuthRedirect } from "@/lib/auth/redirect";
import { ADMIN_PORTAL_HOME } from "@/lib/admin/portal-paths";

export default function AuthCallbackPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setError(exchangeError.message);
            setIsLoading(false);
            return;
          }
        }

        const nextPath = params.get("next");
        const flowType = params.get("type");
        if (nextPath === "/reset-password" || flowType === "recovery" || flowType === "invite") {
          router.replace("/reset-password");
          return;
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          setError(sessionError.message);
          setIsLoading(false);
          return;
        }

        if (!session?.user) {
          setError("Authentication failed. Please try again.");
          setIsLoading(false);
          return;
        }

        const user = session.user;

        if (user.email_confirmed_at) {
          void fetch("/api/auth/sync-email-verified", { method: "POST" });
          void fetch("/api/auth/welcome", { method: "POST" });
          void fetch("/api/auth/signup-session-ready", { method: "POST" });
        }

        const dashboardRole = await fetchProfileRole(user.id, user.user_metadata);
        if (!dashboardRole) {
          router.replace("/choose-role");
          return;
        }

        const portalOAuth = params.get("portal") === "1" || sessionStorage.getItem("nextgrades_admin_oauth") === "1";
        sessionStorage.removeItem("nextgrades_admin_oauth");

        const target = portalOAuth
          ? dashboardRole === "admin"
            ? ADMIN_PORTAL_HOME
            : null
          : resolvePostAuthRedirect(dashboardRole, null);

        if (portalOAuth && dashboardRole !== "admin") {
          await supabase.auth.signOut();
          router.replace("/portal/login?error=access_denied");
          return;
        }

        if (target) {
          router.replace(target);
        }

        void syncPreferencesAfterAuth((lang) => changeAppLanguage(lang));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed");
        setIsLoading(false);
      }
    };

    void handleAuthCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div
            className={`rounded-3xl border p-8 text-center ${theme === "dark" ? "border-white/10 bg-[#112240]" : "border-gray-100 bg-white"}`}
          >
            {isLoading ? (
              <>
                <div className="mb-6 flex justify-center">
                  <BrandLogo size="lg" linked={false} />
                </div>
                <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-[#D4AF37] border-t-transparent" />
                <h2 className={`mb-2 text-xl font-bold text-foreground`}>
                  Konto wird bestätigt…
                </h2>
                <p className="text-text-muted">
                  Gleich geht es weiter zu deinem Dashboard
                </p>
              </>
            ) : error ? (
              <>
                <div
                  className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${theme === "dark" ? "bg-red-900/20" : "bg-red-100"}`}
                >
                  <span className="text-2xl text-red-500">✕</span>
                </div>
                <h2 className={`mb-2 text-xl font-bold text-foreground`}>
                  Bestätigung fehlgeschlagen
                </h2>
                <p className={`mb-6 text-text-muted`}>{error}</p>
                <Button variant="gold" size="md" type="button" onClick={() => router.push("/login")} className="w-full">
                  Zum Login
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
