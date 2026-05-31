"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faCheckCircle,
  faXmark,
  faEnvelope,
  faLock,
  faExclamationCircle,
  faShieldAlt,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  faApple,
  faGoogle,
} from "@fortawesome/free-brands-svg-icons";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase/client";
import { sanitizeRedirect, fetchProfileRole, resolvePostAuthRedirect } from "@/lib/auth/redirect";
import { useToast } from "@/context/ToastContext";
import { syncPreferencesAfterAuth } from "@/lib/preferences";
import { changeAppLanguage } from "@/components/I18nProvider";
import { cn } from "@/lib/utils";
import { useCmsImage } from "@/hooks/useCmsImage";
import { LOGIN_HERO_IMAGE, LOGIN_AVATAR_IMAGES } from "@/lib/marketing-images";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { BrandLogo } from "@/components/BrandLogo";
import { RegisterForm } from "@/components/auth/RegisterForm";

function LoginContent() {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formValidation, setFormValidation] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [duplicateEmail, setDuplicateEmail] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const toast = useToast();
  const loginHeroImage = useCmsImage("cmsImages.auth.loginHero", LOGIN_HERO_IMAGE);

  const redirectTo = sanitizeRedirect(searchParams.get("redirect"));

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Calculate password strength
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z\d]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  // Validate email
  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleInputChange = (field: "email" | "password" | "name", value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    if (field === "email") {
      if (!value) setFormValidation(prev => ({ ...prev, email: "" }));
      else if (!validateEmail(value)) setFormValidation(prev => ({ ...prev, email: "Invalid email" }));
      else setFormValidation(prev => ({ ...prev, email: "" }));
    }
    
    if (field === "password") {
      if (isSignup) {
        const strength = calculatePasswordStrength(value);
        setPasswordStrength(strength);
        if (!value) {
          setFormValidation(prev => ({ ...prev, password: "" }));
        } else if (value.length < 8) {
          setFormValidation(prev => ({ ...prev, password: "At least 8 characters" }));
        } else {
          setFormValidation(prev => ({ ...prev, password: "" }));
        }
      }
    }

    if (field === "name") {
      if (!value) setFormValidation(prev => ({ ...prev, name: "" }));
      else if (value.length < 2) setFormValidation(prev => ({ ...prev, name: "Name too short" }));
      else setFormValidation(prev => ({ ...prev, name: "" }));
    }
  };

  useEffect(() => {
    if (searchParams.get("mode") === "signup") setIsSignup(true);
    const emailParam = searchParams.get("email");
    if (emailParam) setFormData((prev) => ({ ...prev, email: emailParam }));
  }, [searchParams]);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (searchParams.get("suspended") === "1") {
      setError(t("login.accountSuspended", { defaultValue: "Your account has been suspended. Contact support@nextgrades.de if you believe this is a mistake." }));
    } else if (errorParam === "profile_incomplete") {
      setError(t("login.profileIncomplete", { defaultValue: "Your account profile is incomplete. Please contact support." }));
    } else if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams, t]);

  const navigateAfterAuth = async (userId: string) => {
    await syncPreferencesAfterAuth((lang) => changeAppLanguage(lang));
    const role = await fetchProfileRole(userId);
    if (!role) {
      router.push("/choose-role");
      router.refresh();
      return;
    }
    router.push(resolvePostAuthRedirect(role, redirectTo));
    router.refresh();
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const role = await fetchProfileRole(session.user.id);
        if (!role) {
          router.push("/choose-role");
        } else {
          router.push(resolvePostAuthRedirect(role, redirectTo));
        }
        router.refresh();
      }
    };
    checkUser();
  }, [router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignup) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    setDuplicateEmail(false);

    // Validate form
    if (!formData.email || !validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (!formData.password) {
      setError("Please enter your password");
      setLoading(false);
      return;
    }

    try {
      await fetch("/api/auth/confirm-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase() }),
      });

      const result = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success(t("login.welcomeBack", { defaultValue: "Welcome back!" }));
      await navigateAfterAuth(result.data.user!.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        throw error;
      }
    } catch (err: any) {
      setError(err.message);
      setGoogleLoading(false);
    }
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 33) return "bg-red-500";
    if (strength < 66) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 33) return "Weak";
    if (strength < 66) return "Fair";
    return "Strong";
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col",
      theme === "dark"
        ? "bg-gradient-to-br from-[#0D1B2A] via-[#112240] to-[#0D1B2A]"
        : "bg-gradient-to-br from-[#FAFAFA] via-white to-[#D4AF37]/10"
    )}>
      <div className="hidden md:block">
        <Navbar />
      </div>

      <main className="flex flex-1 items-center justify-center px-4 py-8 md:py-24">
        <div className="w-full max-w-6xl">
          {/* Main Card with enhanced styling */}
          <div className={`bg-gradient-to-br ${theme === "dark" ? "from-[#0D1B2A]/90 to-[#1a2e4a]/90" : "from-white/95 to-white/90"} backdrop-blur-xl rounded-3xl shadow-2xl border ${theme === "dark" ? "border-[#D4AF37]/20" : "border-[#D4AF37]/10"} overflow-hidden transition-all duration-300 hover:shadow-2xl`}>
            <div className="grid lg:grid-cols-2">
              {/* Left Side - Form */}
              <div className="p-6 sm:p-12 lg:p-16">
                <div className="mx-auto max-w-md">
                  {/* Mobile logo */}
                  <div className="mb-8 flex justify-center md:hidden">
                    <BrandLogo className="h-10 w-auto" href="/" />
                  </div>
                  {/* Header */}
                  <div className="mb-8 transition-all duration-300">
                    <h1 className={`mb-3 text-3xl font-bold leading-tight md:text-4xl bg-gradient-to-r ${theme === "dark" ? "from-white to-[#D4AF37]" : "from-[#0D1B2A] to-[#D4AF37]"} bg-clip-text text-transparent`}>
                      {isSignup ? "Create Account" : "Welcome Back"}
                    </h1>
                    <p className={`text-base ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                      {isSignup 
                        ? "Join thousands of students and teachers learning with NextGrades" 
                        : "Sign in to continue your learning journey"
                      }
                    </p>
                  </div>

                  {/* Messages */}
                  {error && (
                    <div className={`mb-6 p-4 rounded-xl text-sm border-l-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${
                      theme === "dark" 
                        ? "bg-red-500/10 border-red-500 text-red-300" 
                        : "bg-red-50 border-red-500 text-red-700"
                    }`}>
                      <FontAwesomeIcon icon={faExclamationCircle} className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <span>{error}</span>
                        {duplicateEmail && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => {
                                setIsSignup(false);
                                setDuplicateEmail(false);
                                setError(null);
                              }}
                              className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#0D1B2A] hover:opacity-90"
                            >
                              Go to Login <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Form */}
                  {isSignup ? (
                    <RegisterForm
                      compact
                      redirectTo={redirectTo}
                      onSwitchToLogin={() => {
                        setIsSignup(false);
                        setError(null);
                        setSuccess(null);
                      }}
                    />
                  ) : (
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
                      <label className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Email Address</label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                            formValidation.email
                              ? theme === "dark"
                                ? "border-red-500 bg-red-500/5"
                                : "border-red-200 bg-red-50"
                              : theme === "dark"
                              ? "border-white/10 bg-[#112240]/50"
                              : "border-gray-200 bg-white"
                          } ${theme === "dark" ? "text-white placeholder:text-gray-500" : "text-[#0D1B2A] placeholder:text-gray-400"} focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:bg-white dark:focus:bg-[#1a2e4a]`}
                        />
                      </div>
                      {formValidation.email && <p className="text-xs text-red-500">{formValidation.email}</p>}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
                      <div className="flex justify-between items-center">
                        <label className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Password</label>
                        <Link
                          href="/forgot-password"
                          className="text-xs font-semibold text-[#D4AF37] hover:text-[#e5c158] transition-colors"
                        >
                          Forgot?
                        </Link>
                      </div>
                      <div className="relative">
                        <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          className={`w-full pl-12 pr-14 py-3 rounded-xl border-2 transition-all duration-200 ${
                            formValidation.password
                              ? theme === "dark"
                                ? "border-red-500 bg-red-500/5"
                                : "border-red-200 bg-red-50"
                              : theme === "dark"
                              ? "border-white/10 bg-[#112240]/50"
                              : "border-gray-200 bg-white"
                          } ${theme === "dark" ? "text-white placeholder:text-gray-500" : "text-[#0D1B2A] placeholder:text-gray-400"} focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:bg-white dark:focus:bg-[#1a2e4a]`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors duration-200"
                        >
                          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="w-5 h-5" />
                        </button>
                      </div>
                      {formValidation.password && <p className="text-xs text-red-500">{formValidation.password}</p>}
                    </div>

                    <Button
                      variant="gold"
                      size="xl"
                      className="w-full !rounded-xl mt-7 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-[#0D1B2A] border-t-transparent rounded-full animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        <>
                          Sign In
                          <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>

                    {/* Divider */}
                    <div className="relative my-7">
                      <div className="absolute inset-0 flex items-center">
                        <div className={`w-full border-t ${theme === "dark" ? "border-white/10" : "border-gray-200"}`} />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className={`px-4 font-medium ${theme === "dark" ? "bg-[#0D1B2A] text-gray-400" : "bg-white text-gray-500"}`}>
                          Or continue with
                        </span>
                      </div>
                    </div>

                    {/* Social Buttons */}
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading}
                      className={`w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                        theme === "dark"
                          ? "border-white/10 bg-[#112240]/50 hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 text-white"
                          : "border-gray-200 bg-white hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 text-gray-700"
                      } ${googleLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {googleLoading ? (
                        <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FontAwesomeIcon icon={faGoogle} className="w-5 h-5" />
                      )}
                      <span className="font-semibold">Continue with Google</span>
                    </button>
                  </form>
                  )}

                  {/* Footer */}
                  <div className="mt-12 space-y-4">
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      {isSignup ? "Already have an account?" : "Don't have an account?"}
                      <button
                        onClick={() => {
                          setIsSignup(!isSignup);
                          setError(null);
                          setSuccess(null);
                          setFormData({ name: "", email: "", password: "" });
                        }}
                        className="ml-2 font-bold text-[#D4AF37] hover:text-[#e5c158] transition-colors duration-200"
                      >
                        {isSignup ? "Sign In" : "Sign Up"}
                      </button>
                    </p>

                    <p className={`text-xs leading-relaxed ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                      By continuing, you agree to our{" "}
                      <Link href="/terms" className="text-[#D4AF37] hover:text-[#e5c158] font-semibold transition-colors">
                        Terms of Service
                      </Link>
                      {" "}and{" "}
                      <Link href="/privacy" className="text-[#D4AF37] hover:text-[#e5c158] font-semibold transition-colors">
                        Privacy Policy
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side - Image */}
              <div className="relative bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 hidden lg:block overflow-hidden">
                <div className="relative h-full min-h-[600px]">
                  <MarketingImage
                    src={loginHeroImage}
                    alt="Students collaborating"
                    containerClassName="absolute inset-0"
                    sizes="50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A]/40 via-[#D4AF37]/10 to-[#0D1B2A]/20" />

                  {/* Animated Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/60 to-transparent" />

                  {/* Floating Cards with Animation */}
                  <div className="absolute top-20 left-8 right-24 animate-bounce" style={{ animationDelay: "0s" }}>
                    <div className="bg-[#D4AF37] rounded-2xl p-5 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-[#0D1B2A]" />
                        <p className="font-bold text-[#0D1B2A]">Quiz Completed</p>
                      </div>
                      <p className="text-sm text-[#0D1B2A]/80">Great job! 92% score</p>
                    </div>
                  </div>

                  <div className="absolute bottom-40 left-16 right-32 animate-bounce" style={{ animationDelay: "0.2s" }}>
                    <div className={`bg-white rounded-2xl p-5 shadow-2xl transform hover:scale-105 transition-transform duration-300 ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <FontAwesomeIcon icon={faShieldAlt} className="w-5 h-5 text-[#D4AF37]" />
                        <p className={`font-bold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>Secure Learning</p>
                      </div>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Your data is encrypted</p>
                    </div>
                  </div>

                  {/* Profile Avatars */}
                  <div className="absolute bottom-12 right-8">
                    <div className="flex -space-x-3">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-full border-4 border-white shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer"
                        >
                          <MarketingImage
                            src={LOGIN_AVATAR_IMAGES[i]}
                            alt={`Student ${i + 1}`}
                            width={48}
                            height={48}
                            sizes="48px"
                            className="rounded-full"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-white mt-3 text-center font-semibold">Join 10K+ students</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">…</div>}>
      <LoginContent />
    </Suspense>
  );
}
