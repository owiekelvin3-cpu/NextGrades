"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/lib/supabase/client";
import { fetchProfileRole, resolvePostAuthRedirect } from "@/lib/auth/redirect";
import { cn } from "@/lib/utils";
import { FontAwesomeSetup } from "@/components/auth/FontAwesomeSetup";

export default function ChooseRolePage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const existingRole = await fetchProfileRole(session.user.id);
      if (existingRole) {
        router.replace(resolvePostAuthRedirect(existingRole, null));
        return;
      }

      setChecking(false);
    };

    void check();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = (await res.json()) as { error?: string; role?: string };
      if (!res.ok) {
        throw new Error(data.error || "Could not save your role");
      }

      router.replace(resolvePostAuthRedirect(role, null));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#D4AF37] border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <FontAwesomeSetup />
    <div className={cn("flex min-h-screen flex-col", theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]")}>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          <div
            className={cn(
              "rounded-3xl border p-8 shadow-xl",
              theme === "dark" ? "border-white/10 bg-[#112240]/90" : "border-gray-100 bg-white"
            )}
          >
            <h1 className={cn("text-2xl font-bold", "text-foreground")}>
              Choose your account type
            </h1>
            <p className={cn("mt-2 text-sm", "text-text-muted")}>
              Select whether you are joining as a student or a teacher. This is set once for your account.
            </p>

            {error && (
              <div
                className={cn(
                  "mt-4 flex items-start gap-2 rounded-xl border-l-4 p-3 text-sm",
                  theme === "dark" ? "border-red-500 bg-red-500/10 text-red-300" : "border-red-500 bg-red-50 text-red-700"
                )}
              >
                <FontAwesomeIcon icon={faExclamationCircle} className="mt-0.5 w-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {(["student", "teacher"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRole(option)}
                    className={cn(
                      "rounded-xl border-2 p-4 text-left transition-all",
                      role === option
                        ? "border-[#D4AF37] bg-[#D4AF37]/10"
                        : theme === "dark"
                          ? "border-white/10 bg-[#112240]/50 hover:border-[#D4AF37]/40"
                          : "border-gray-200 bg-white hover:border-[#D4AF37]/40"
                    )}
                  >
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37]/20">
                      <FontAwesomeIcon icon={faUser} className="w-5 text-[#D4AF37]" />
                    </div>
                    <p className={cn("font-bold capitalize", "text-foreground")}>
                      {option}
                    </p>
                    <p className={cn("mt-1 text-xs", "text-text-muted")}>
                      {option === "student" ? "Learn & grow" : "Teach & inspire"}
                    </p>
                  </button>
                ))}
              </div>

              <Button variant="gold" size="xl" className="w-full !rounded-xl" disabled={loading}>
                {loading ? "Saving…" : "Continue"}
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
    </>
  );
}
