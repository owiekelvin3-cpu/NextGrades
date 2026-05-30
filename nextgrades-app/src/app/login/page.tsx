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
  faUser,
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
import { sanitizeRedirect } from "@/lib/auth/redirect";
import { resolveUserRole } from "@/lib/auth/roles";
import { useToast } from "@/context/ToastContext";
import { syncPreferencesAfterAuth } from "@/lib/preferences";
import { changeAppLanguage } from "@/components/I18nProvider";
import { cn } from "@/lib/utils";
import { sendWelcomeEmail } from "@/lib/email";

function LoginContent() {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher">("student");
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
  }, [searchParams]);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "profile_incomplete") {
      setError(t("login.profileIncomplete", { defaultValue: "Your account profile is incomplete. Please contact support." }));
    } else if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const navigateAfterAuth = async (userId: string, fallbackRole: "student" | "teacher") => {
    await syncPreferencesAfterAuth((lang) => changeAppLanguage(lang));
    if (redirectTo) {
      router.push(redirectTo);
      router.refresh();
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
    const role = resolveUserRole(profile?.role, user?.user_metadata) || fallbackRole;
    router.push(`/dashboard/${role}`);
    router.refresh();
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();
          router.push(`/dashboard/${profile?.role || "student"}`);
        }
        router.refresh();
      }
    };
    checkUser();
  }, [router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    if (isSignup) {
      if (selectedRole === "student") {
        router.push("/register");
        setLoading(false);
        return;
      }
      if (!formData.name || formData.name.length < 2) {
        setError("Please enter your full name");
        setLoading(false);
        return;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        setLoading(false);
        return;
      }

      const checkRes = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase() }),
      });
      const checkData = await checkRes.json();
      if (checkData.exists) {
        setError("An account with this email already exists. Please sign in to continue.");
        setDuplicateEmail(true);
        setLoading(false);
        return;
      }
    }

    try {
      let result;
      if (isSignup) {
        // Sign up
        result = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              role: selectedRole,
            },
          },
        });
        if (!result.error) {
          setSuccess(t("loginPage.emailConfirm"));
          setFormData({ name: "", email: "", password: "" });
        }
      } else {
        // Sign in
        result = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
      }

      if (result.error) {
        const msg = result.error.message.toLowerCase();
        if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("user already")) {
          setDuplicateEmail(true);
          throw new Error("An account with this email already exists. Please sign in to continue.");
        }
        throw new Error(result.error.message);
      }

      if (isSignup && result.data.user && result.data.session) {
        await supabase
          .from("profiles")
          .update({ role: selectedRole, full_name: formData.name })
          .eq("id", result.data.user.id);

        void sendWelcomeEmail(formData.email, formData.name, selectedRole);
      }

      if (!isSignup || result.data.session) {
        toast.success(isSignup ? t("loginPage.emailConfirm") : t("login.welcomeBack", { defaultValue: "Welcome back!" }));
        await navigateAfterAuth(result.data.user!.id, selectedRole);
      }
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
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-24 px-4">
        <div className="w-full max-w-6xl">
          {/* Main Card with enhanced styling */}
          <div className={`bg-gradient-to-br ${theme === "dark" ? "from-[#0D1B2A]/90 to-[#1a2e4a]/90" : "from-white/95 to-white/90"} backdrop-blur-xl rounded-3xl shadow-2xl border ${theme === "dark" ? "border-[#D4AF37]/20" : "border-[#D4AF37]/10"} overflow-hidden transition-all duration-300 hover:shadow-2xl`}>
            <div className="grid lg:grid-cols-2">
              {/* Left Side - Form */}
              <div className="p-8 sm:p-12 lg:p-16">
                <div className="max-w-md mx-auto">
                  {/* Header */}
                  <div className="mb-8 transition-all duration-300">
                    <h1 className={`text-4xl font-bold mb-3 bg-gradient-to-r ${theme === "dark" ? "from-white to-[#D4AF37]" : "from-[#0D1B2A] to-[#D4AF37]"} bg-clip-text text-transparent`}>
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

                  {success && (
                    <div className={`mb-6 p-4 rounded-xl text-sm border-l-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${
                      theme === "dark"
                        ? "bg-green-500/10 border-green-500 text-green-300"
                        : "bg-green-50 border-green-500 text-green-700"
                    }`}>
                      <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Email confirmation sent!</div>
                        <div className="text-xs opacity-75">Check your inbox to verify your email address</div>
                      </div>
                    </div>
                  )}

                  {/* Role Selection (for login) */}
                  {!isSignup && (
                    <div className="space-y-3 mb-8 animate-in fade-in slide-in-from-left-2">
                      <label className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>I'm logging in as</label>
                      <div className="grid grid-cols-2 gap-3">
                        {["student", "teacher"].map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setSelectedRole(role as "student" | "teacher")}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left transform hover:scale-105 ${
                              selectedRole === role
                                ? `border-[#D4AF37] ${theme === "dark" ? "bg-[#D4AF37]/15" : "bg-[#D4AF37]/10"}`
                                : theme === "dark"
                                ? "border-white/10 bg-[#112240]/50 hover:border-[#D4AF37]/40"
                                : "border-gray-200 bg-white hover:border-[#D4AF37]/40"
                            }`}
                          >
                            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mb-2">
                              <FontAwesomeIcon icon={faUser} className={`w-5 h-5 ${theme === "dark" ? "text-[#D4AF37]" : "text-[#0D1B2A]"}`} />
                            </div>
                            <h3 className={`font-bold text-sm ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </h3>
                            <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                              {role === "student" ? "Learn & grow" : "Teach & inspire"}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Form */}
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    {isSignup && (
                      <>
                        <div className="space-y-3 animate-in fade-in slide-in-from-left-2">
                          <label className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Full Name</label>
                          <div className="relative">
                            <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Enter your full name"
                              value={formData.name}
                              onChange={(e) => handleInputChange("name", e.target.value)}
                              className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                                formValidation.name
                                  ? theme === "dark"
                                    ? "border-red-500 bg-red-500/5"
                                    : "border-red-200 bg-red-50"
                                  : theme === "dark"
                                  ? "border-white/10 bg-[#112240]/50"
                                  : "border-gray-200 bg-white"
                              } ${theme === "dark" ? "text-white placeholder:text-gray-500" : "text-[#0D1B2A] placeholder:text-gray-400"} focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:bg-white dark:focus:bg-[#1a2e4a]`}
                            />
                          </div>
                          {formValidation.name && <p className="text-xs text-red-500">{formValidation.name}</p>}
                        </div>

                        {/* Role Selection (for signup) */}
                        <div className="space-y-3 animate-in fade-in slide-in-from-left-2">
                          <label className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>I'm a</label>
                          <div className="grid grid-cols-2 gap-3">
                            {["student", "teacher"].map((role) => (
                              <button
                                key={role}
                                type="button"
                                onClick={() => setSelectedRole(role as "student" | "teacher")}
                                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left transform hover:scale-105 ${
                                  selectedRole === role
                                    ? `border-[#D4AF37] ${theme === "dark" ? "bg-[#D4AF37]/15" : "bg-[#D4AF37]/10"}`
                                    : theme === "dark"
                                    ? "border-white/10 bg-[#112240]/50 hover:border-[#D4AF37]/40"
                                    : "border-gray-200 bg-white hover:border-[#D4AF37]/40"
                                }`}
                              >
                                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mb-2">
                                  <FontAwesomeIcon icon={faUser} className={`w-5 h-5 ${theme === "dark" ? "text-[#D4AF37]" : "text-[#0D1B2A]"}`} />
                                </div>
                                <h3 className={`font-bold text-sm ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                                  {role.charAt(0).toUpperCase() + role.slice(1)}
                                </h3>
                                <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                  {role === "student" ? "I want to learn" : "I want to teach"}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {selectedRole === "student" && (
                          <div className={`rounded-xl border p-4 text-sm ${theme === "dark" ? "border-[#D4AF37]/30 bg-[#D4AF37]/10 text-gray-200" : "border-[#D4AF37]/40 bg-[#D4AF37]/5 text-gray-700"}`}>
                            <p className="font-semibold mb-2">Student registration</p>
                            <p className="mb-3 opacity-90">Use our guided registration form with email verification to create your student account.</p>
                            <Link
                              href="/register"
                              className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#0D1B2A] hover:opacity-90"
                            >
                              Continue to Registration <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                            </Link>
                          </div>
                        )}
                      </>
                    )}

                    {!(isSignup && selectedRole === "student") && (
                      <>
                    {/* Email Field */}
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
                        {!isSignup && (
                          <Link
                            href="/forgot-password"
                            className="text-xs font-semibold text-[#D4AF37] hover:text-[#e5c158] transition-colors"
                          >
                            Forgot?
                          </Link>
                        )}
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
                      {isSignup && formData.password && (
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">Strength:</span>
                            <span className={`text-xs font-bold ${passwordStrength < 33 ? "text-red-500" : passwordStrength < 66 ? "text-yellow-500" : "text-green-500"}`}>
                              {getPasswordStrengthText(passwordStrength)}
                            </span>
                          </div>
                          <div className={`h-2 rounded-full bg-gray-200 overflow-hidden ${theme === "dark" ? "bg-gray-700" : ""}`}>
                            <div className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`} style={{ width: `${passwordStrength}%` }} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      variant="gold"
                      size="xl"
                      className="w-full !rounded-xl mt-7 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-[#0D1B2A] border-t-transparent rounded-full animate-spin" />
                          {isSignup ? "Creating Account..." : "Signing In..."}
                        </>
                      ) : (
                        <>
                          {isSignup ? "Create Account" : "Sign In"}
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
                      </>
                    )}
                  </form>

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
                  {/* Background Image */}
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000&h=1200&fit=crop"
                    alt="Students collaborating"
                    className="w-full h-full object-cover"
                    loading="lazy"
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
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-full border-4 border-white shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer"
                        >
                          <img
                            src={`https://images.unsplash.com/photo-${
                              i === 1 ? "1494790109226-7f0e5a5f1599" :
                              i === 2 ? "1528899613728-333" :
                              "1507003211169-0a1dd7228f2d"
                            }?w=100&h=100&fit=crop&crop=face`}
                            alt={`Student ${i}`}
                            className="w-full h-full rounded-full object-cover"
                            loading="lazy"
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

      <Footer />
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
