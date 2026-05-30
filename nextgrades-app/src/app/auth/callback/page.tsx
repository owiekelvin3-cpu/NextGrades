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
import { sendWelcomeEmail } from "@/lib/email";
import { resolveUserRole } from "@/lib/auth/roles";

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
        const meta = user.user_metadata;
        const fullName = meta.full_name || meta.name || "User";
        const role = resolveUserRole(null, meta) || "student";

        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name, email_verified")
          .eq("id", user.id)
          .maybeSingle();

        if (!profile) {
          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            full_name: fullName,
            role,
            email_verified: Boolean(user.email_confirmed_at),
          });
        } else {
          await supabase
            .from("profiles")
            .update({
              full_name: profile.full_name || fullName,
              email_verified: Boolean(user.email_confirmed_at),
              email_verified_at: user.email_confirmed_at ?? new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);
        }

        if (user.email && user.email_confirmed_at) {
          void sendWelcomeEmail(user.email, fullName, role === "teacher" ? "teacher" : "student");
        }

        await syncPreferencesAfterAuth((lang) => changeAppLanguage(lang));

        const { data: updatedProfile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        const dashboardRole = resolveUserRole(updatedProfile?.role, meta) || role;
        router.replace(`/dashboard/${dashboardRole}`);
        router.refresh();
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
                <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-[#D4AF37] border-t-transparent" />
                <h2 className={`mb-2 text-xl font-bold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                  Verifying your account…
                </h2>
                <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                  Please wait while we sign you in
                </p>
              </>
            ) : error ? (
              <>
                <div
                  className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${theme === "dark" ? "bg-red-900/20" : "bg-red-100"}`}
                >
                  <span className="text-2xl text-red-500">✕</span>
                </div>
                <h2 className={`mb-2 text-xl font-bold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                  Verification failed
                </h2>
                <p className={`mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{error}</p>
                <button
                  onClick={() => router.push("/login")}
                  className="w-full rounded-2xl bg-[#D4AF37] px-6 py-3 font-bold text-[#0D1B2A] transition-all hover:opacity-90"
                >
                  Go to Login
                </button>
              </>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
