"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/context/ThemeContext";
import { Shield, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { ADMIN_PORTAL_HOME, ADMIN_PORTAL_LOGIN, mapLegacyAdminPath } from "@/lib/admin/portal-paths";

type AdminMe = {
  email: string | null;
  role: string | null;
  isAdmin: boolean;
};

export default function AdminAccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <AdminAccessContent />
    </Suspense>
  );
}

function AdminAccessContent() {
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = mapLegacyAdminPath(searchParams.get("return") || ADMIN_PORTAL_HOME);

  const [me, setMe] = useState<AdminMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then(async (res) => {
        if (res.status === 401) {
          router.replace(`${ADMIN_PORTAL_LOGIN}?redirect=${encodeURIComponent("/admin-access")}`);
          return;
        }
        const data = await res.json();
        setMe(data);
        if (data.isAdmin) {
          router.replace(returnTo);
        }
      })
      .finally(() => setLoading(false));
  }, [router, returnTo]);

  const handleBootstrap = async () => {
    setBootstrapping(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/bootstrap", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not grant admin access");
      }
      setMessage(data.message || "Admin access granted.");
      setTimeout(() => router.push(returnTo), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bootstrap failed");
    } finally {
      setBootstrapping(false);
    }
  };

  const panel = theme === "dark" ? "bg-[#112240] border-white/10 text-white" : "bg-white border-gray-100 text-[#0D1B2A]";
  const muted = "text-text-muted";

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]"}`}>
      <Navbar />
      <main className="flex-1 px-4 py-24">
        <div className="max-w-2xl mx-auto">
          <Card className={`p-8 sm:p-10 border ${panel}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin access required</h1>
                <p className={`text-sm ${muted}`}>The admin portal is restricted to platform administrators.</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center gap-3 py-8 justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
                <span className={muted}>Checking your account…</span>
              </div>
            ) : (
              <>
                <div className={`rounded-xl p-4 mb-6 text-sm ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-gray-50"}`}>
                  <p className={muted}>Signed in as</p>
                  <p className="font-semibold">{me?.email || "Unknown"}</p>
                  <p className={`mt-2 ${muted}`}>
                    Current role: <span className="font-medium capitalize">{me?.role || "unknown"}</span>
                  </p>
                </div>

                {message && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-300">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{message}</span>
                  </div>
                )}

                {error && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-6">
                  <section>
                    <h2 className="font-semibold mb-2">Option 1 - Quick setup (recommended for owner)</h2>
                    <ol className={`list-decimal list-inside space-y-2 text-sm ${muted}`}>
                      <li>Add to <code className="text-[#D4AF37]">.env.local</code>: <code>ADMIN_BOOTSTRAP_EMAIL=your@email.com</code></li>
                      <li>Ensure <code className="text-[#D4AF37]">SUPABASE_SERVICE_ROLE_KEY</code> is set</li>
                      <li>Restart the dev server, then click below while signed in with that email</li>
                    </ol>
                    <Button
                      variant="gold"
                      className="mt-4 w-full sm:w-auto"
                      disabled={bootstrapping}
                      onClick={handleBootstrap}
                    >
                      {bootstrapping ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Granting access…
                        </>
                      ) : (
                        <>Grant admin access to this account</>
                      )}
                    </Button>
                  </section>

                  <section>
                    <h2 className="font-semibold mb-2">Option 2 - Supabase SQL</h2>
                    <p className={`text-sm mb-3 ${muted}`}>
                      Run in Supabase → SQL Editor (file: <code>supabase/GRANT_ADMIN.sql</code>):
                    </p>
                    <pre className={`text-xs p-4 rounded-xl overflow-x-auto ${theme === "dark" ? "bg-[#0D1B2A] text-gray-300" : "bg-gray-100 text-gray-800"}`}>
{`UPDATE public.profiles
SET role = 'admin', updated_at = now()
WHERE email = '${me?.email || "your@email.com"}';`}
                    </pre>
                    <p className={`text-xs mt-2 ${muted}`}>Then refresh this page or sign out and back in.</p>
                  </section>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button variant="outline" href="/">
                    Back to Homepage
                  </Button>
                  {me?.role && me.role !== "admin" && (
                    <Button variant="outline" href={`/dashboard/${me.role}`}>
                      Back to my dashboard
                    </Button>
                  )}
                  <Link
                    href={ADMIN_PORTAL_LOGIN}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF37] hover:opacity-90"
                  >
                    Admin portal login <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
