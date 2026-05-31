"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faCheckCircle,
  faArrowLeft,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { FontAwesomeSetup } from "@/components/auth/FontAwesomeSetup";
import { AuthGuestGuard } from "@/components/auth/AuthGuestGuard";

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details || "Failed to send reset email");
      }

      setSubmittedEmail(email);
      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FontAwesomeSetup />
    <div className={cn(
      "min-h-screen flex flex-col",
      theme === "dark"
        ? "bg-gradient-to-br from-[#0D1B2A] via-[#112240] to-[#0D1B2A]"
        : "bg-gradient-to-br from-[#FAFAFA] via-white to-[#D4AF37]/10"
    )}>
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-24 px-4">
        <div className="w-full max-w-md">
          {/* Main Card */}
          <div className={`bg-gradient-to-br ${
            theme === "dark"
              ? "from-[#0D1B2A]/90 to-[#1a2e4a]/90"
              : "from-white/95 to-white/90"
          } backdrop-blur-xl rounded-2xl shadow-2xl border ${
            theme === "dark"
              ? "border-[#D4AF37]/20"
              : "border-[#D4AF37]/10"
          } overflow-hidden transition-all duration-300`}>
            
            <div className="p-8 sm:p-12">
              {/* Header */}
              <div className="text-center mb-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  success
                    ? "bg-green-500/20"
                    : "bg-[#D4AF37]/20"
                }`}>
                  <FontAwesomeIcon
                    icon={success ? faCheckCircle : faEnvelope}
                    className={`w-8 h-8 ${
                      success
                        ? "text-green-500"
                        : "text-[#D4AF37]"
                    }`}
                  />
                </div>
                
                <h1 className={`text-3xl font-bold mb-2 bg-gradient-to-r ${
                  theme === "dark"
                    ? "from-white to-[#D4AF37]"
                    : "from-[#0D1B2A] to-[#D4AF37]"
                } bg-clip-text text-transparent`}>
                  {success
                    ? "Check Your Email"
                    : "Reset Password"}
                </h1>
                
                <p className={`text-sm ${
                  theme === "dark"
                    ? "text-gray-300"
                    : "text-gray-600"
                }`}>
                  {success
                    ? "We've sent password reset instructions to your email"
                    : "Enter your email and we'll send you a link to reset your password"}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className={`mb-6 p-4 rounded-xl text-sm border-l-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${
                  theme === "dark"
                    ? "bg-red-500/10 border-red-500 text-red-300"
                    : "bg-red-50 border-red-500 text-red-700"
                }`}>
                  <FontAwesomeIcon icon={faExclamationCircle} className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success State */}
              {success ? (
                <div className="space-y-6 text-center animate-in fade-in">
                  <div className={`p-6 rounded-xl border-2 ${
                    theme === "dark"
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-green-200 bg-green-50"
                  }`}>
                    <p className={`text-sm leading-relaxed mb-4 ${
                      theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-600"
                    }`}>
                      We've sent a password reset link to <strong>{submittedEmail}</strong>.
                      Click the link in the email to reset your password.
                    </p>
                    <p className={`text-xs ${
                      theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}>
                      The link expires in <strong>1 hour</strong> for security reasons. 
                      Don't forget to check your spam folder!
                    </p>
                  </div>

                  <Link href="/login" className="block">
                    <Button variant="gold" size="lg" className="w-full !rounded-xl">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              ) : (
                /* Reset Form */
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
                    <label className={`text-sm font-semibold ${
                      theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}>
                      Email Address
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                      />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                          theme === "dark"
                            ? "border-white/10 bg-[#112240]/50"
                            : "border-gray-200 bg-white"
                        } ${
                          theme === "dark"
                            ? "text-white placeholder:text-gray-500"
                            : "text-[#0D1B2A] placeholder:text-gray-400"
                        } focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:bg-white dark:focus:bg-[#1a2e4a]`}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    variant="gold"
                    size="xl"
                    className="w-full !rounded-xl mt-7 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-[#0D1B2A] border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              )}

              {/* Footer Link */}
              <div className={`mt-8 text-center pt-6 border-t ${
                theme === "dark"
                  ? "border-white/10"
                  : "border-gray-200"
              }`}>
                <Link
                  href="/login"
                  className={`inline-flex items-center gap-2 text-sm font-semibold ${
                    theme === "dark"
                      ? "text-gray-400 hover:text-[#D4AF37]"
                      : "text-gray-500 hover:text-[#D4AF37]"
                  } transition-colors duration-200`}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className={`mt-8 p-4 rounded-xl border ${
            theme === "dark"
              ? "border-white/10 bg-white/5"
              : "border-gray-200 bg-gray-50"
          }`}>
            <p className={`text-xs text-center ${
              theme === "dark"
                ? "text-gray-400"
                : "text-gray-600"
            }`}>
              🔒 Your password reset link is secure and valid for 1 hour. 
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </>
  );
}

export default function ForgotPasswordPage() {
  return (
    <AuthGuestGuard>
      <ForgotPasswordContent />
    </AuthGuestGuard>
  );
}
