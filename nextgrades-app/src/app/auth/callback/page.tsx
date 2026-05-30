"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { syncPreferencesAfterAuth } from "@/lib/preferences";
import { changeAppLanguage } from "@/components/I18nProvider";
import { sendWelcomeEmail } from "@/lib/email";

export default function AuthCallbackPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setError(sessionError.message);
          setIsLoading(false);
          return;
        }

        if (!session?.user) {
          console.error("No session found");
          setError("Authentication failed. Please try again.");
          setIsLoading(false);
          return;
        }

        // Check if user already has a profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") { // PGRST116 is "no rows returned"
          console.error("Profile error:", profileError);
          setError(profileError.message);
          setIsLoading(false);
          return;
        }

        // If no profile, create one
        if (!profile) {
          const userMetadata = session.user.user_metadata;
          const { error: createError } = await supabase
            .from("profiles")
            .insert({
              id: session.user.id,
              full_name: userMetadata.full_name || userMetadata.name || "User",
              role: "student", // default to student
              avatar_url: userMetadata.avatar_url || userMetadata.picture,
            });

          if (createError) {
            console.error("Create profile error:", createError);
            setError(createError.message);
            setIsLoading(false);
            return;
          }

          // Create user units or teacher stats
          await supabase.from("user_units").insert({ student_id: session.user.id });

          const email = session.user.email;
          const name = userMetadata.full_name || userMetadata.name || "User";
          if (email) {
            void sendWelcomeEmail(email, name, "student");
          }
        }

        // Sync theme + language from database
        await syncPreferencesAfterAuth((lang) => changeAppLanguage(lang));

        // Redirect to appropriate dashboard
        const finalProfile = profile || (await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()).data;

        router.push(`/dashboard/${finalProfile?.role || "student"}`);
        router.refresh();
      } catch (err: any) {
        console.error("Error in callback:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className={`p-8 rounded-3xl border ${theme === "dark" ? "bg-[#112240] border-white/10" : "bg-white border-gray-100"} text-center`}>
            {isLoading ? (
              <>
                <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <h2 className={`text-xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                  Authenticating...
                </h2>
                <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                  Please wait while we sign you in
                </p>
              </>
            ) : error ? (
              <>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${theme === "dark" ? "bg-red-900/20" : "bg-red-100"}`}>
                  <span className="text-2xl text-red-500">✕</span>
                </div>
                <h2 className={`text-xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                  Authentication Failed
                </h2>
                <p className={`mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {error}
                </p>
                <button
                  onClick={() => router.push("/login")}
                  className="w-full py-3 px-6 rounded-2xl bg-[#D4AF37] text-[#0D1B2A] font-bold transition-all hover:opacity-90"
                >
                  Go Back to Login
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
