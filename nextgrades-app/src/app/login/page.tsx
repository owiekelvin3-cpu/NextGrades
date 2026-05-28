
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "@fortawesome/free-solid-svg-icons";
import {
  faApple,
  faGoogle,
} from "@fortawesome/free-brands-svg-icons";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher">("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      router.push(`/dashboard/${selectedRole}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-24 px-4">
        <div className="w-full max-w-6xl">
          {/* Main Card */}
          <div className={`bg-gradient-to-br ${theme === "dark" ? "from-white/10 to-[#D4AF37]/10" : "from-white/90 to-[#D4AF37]/10"} backdrop-blur-xl rounded-3xl shadow-2xl border ${theme === "dark" ? "border-white/20" : "border-white/20"} overflow-hidden`}>
            <div className="grid lg:grid-cols-2">
              {/* Left Side - Form */}
              <div className="p-8 sm:p-12 lg:p-16">
                <div className="max-w-md mx-auto">
                  <h1 className={`text-3xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                    {isSignup ? t("login.createAccount") : t("login.welcomeBack")}
                  </h1>
                  <p className={`mb-8 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    {isSignup ? t("login.signupDescription") : t("login.loginDescription")}
                  </p>

                  {error && (
                    <div className={`mb-6 p-4 rounded-2xl text-sm ${theme === "dark" ? "bg-red-900/20 border border-red-500/30 text-red-400" : "bg-red-50 border border-red-200 text-red-700"}`}>
                      {error}
                    </div>
                  )}

                  {/* Role Selection (for both) */}
                  {!isSignup && (
                    <div className="space-y-2 mb-7">
                      <label className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>{t("login.iAmLoggingInAs")}</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setSelectedRole("student")}
                          className={`p-5 rounded-2xl border-2 transition-all text-left ${
                            selectedRole === "student"
                              ? "border-[#D4AF37] bg-[#D4AF37]/10"
                              : theme === "dark"
                              ? "border-white/10 bg-[#112240] hover:border-[#D4AF37]/40"
                              : "border-gray-200 bg-white hover:border-[#D4AF37]/40"
                          }`}
                        >
                          <div className="w-12 h-12 rounded-full bg-[#0D1B2A]/10 dark:bg-white/10 flex items-center justify-center mb-3">
                            <FontAwesomeIcon icon={faUser} className={`w-6 h-6 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`} />
                          </div>
                          <h3 className={`font-bold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>{t("login.student")}</h3>
                          <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{t("login.studentLogin")}</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedRole("teacher")}
                          className={`p-5 rounded-2xl border-2 transition-all text-left ${
                            selectedRole === "teacher"
                              ? "border-[#D4AF37] bg-[#D4AF37]/10"
                              : theme === "dark"
                              ? "border-white/10 bg-[#112240] hover:border-[#D4AF37]/40"
                              : "border-gray-200 bg-white hover:border-[#D4AF37]/40"
                          }`}
                        >
                          <div className="w-12 h-12 rounded-full bg-[#0D1B2A]/10 dark:bg-white/10 flex items-center justify-center mb-3">
                            <FontAwesomeIcon icon={faUser} className={`w-6 h-6 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`} />
                          </div>
                          <h3 className={`font-bold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>{t("login.teacher")}</h3>
                          <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{t("login.teacherLogin")}</p>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Form */}
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    {isSignup && (
                      <>
                        <div className="space-y-1">
                          <label className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>{t("login.fullName")}</label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                              <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              placeholder="Lisa Schmidt"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className={`w-full pl-12 pr-5 py-4 rounded-2xl border transition-all ${
                                theme === "dark"
                                  ? "border-white/10 bg-[#112240] text-white placeholder:text-gray-400"
                                  : "border-gray-200 bg-white text-[#0D1B2A] placeholder:text-gray-400"
                              } focus:outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10`}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>{t("login.iAmA")}</label>
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              type="button"
                              onClick={() => setSelectedRole("student")}
                              className={`p-5 rounded-2xl border-2 transition-all text-left ${
                                selectedRole === "student"
                                  ? "border-[#D4AF37] bg-[#D4AF37]/10"
                                  : theme === "dark"
                                  ? "border-white/10 bg-[#112240] hover:border-[#D4AF37]/40"
                                  : "border-gray-200 bg-white hover:border-[#D4AF37]/40"
                              }`}
                            >
                              <div className="w-12 h-12 rounded-full bg-[#0D1B2A]/10 dark:bg-white/10 flex items-center justify-center mb-3">
                                <FontAwesomeIcon icon={faUser} className={`w-6 h-6 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`} />
                              </div>
                              <h3 className={`font-bold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>{t("login.student")}</h3>
                              <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{t("login.iWantToLearn")}</p>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedRole("teacher")}
                              className={`p-5 rounded-2xl border-2 transition-all text-left ${
                                selectedRole === "teacher"
                                  ? "border-[#D4AF37] bg-[#D4AF37]/10"
                                  : theme === "dark"
                                  ? "border-white/10 bg-[#112240] hover:border-[#D4AF37]/40"
                                  : "border-gray-200 bg-white hover:border-[#D4AF37]/40"
                              }`}
                            >
                              <div className="w-12 h-12 rounded-full bg-[#0D1B2A]/10 dark:bg-white/10 flex items-center justify-center mb-3">
                                <FontAwesomeIcon icon={faUser} className={`w-6 h-6 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`} />
                              </div>
                              <h3 className={`font-bold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>{t("login.teacher")}</h3>
                              <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{t("login.iWantToTeach")}</p>
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-1">
                      <label className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>{t("login.email")}</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          placeholder="lisa.schmidt@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`w-full pl-12 pr-5 py-4 rounded-2xl border transition-all ${
                            theme === "dark"
                              ? "border-white/10 bg-[#112240] text-white placeholder:text-gray-400"
                              : "border-gray-200 bg-white text-[#0D1B2A] placeholder:text-gray-400"
                          } focus:outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>{t("login.password")}</label>
                        {!isSignup && (
                          <Link
                            href="/forgot-password"
                            className="text-sm font-semibold text-[#D4AF37] hover:text-[#b8900f] transition-colors"
                          >
                            {t("login.forgot")}
                          </Link>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <FontAwesomeIcon icon={faLock} className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className={`w-full pl-12 pr-14 py-4 rounded-2xl border transition-all ${
                            theme === "dark"
                              ? "border-white/10 bg-[#112240] text-white placeholder:text-gray-400"
                              : "border-gray-200 bg-white text-[#0D1B2A] placeholder:text-gray-400"
                          } focus:outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors"
                        >
                          <FontAwesomeIcon
                            icon={showPassword ? faEyeSlash : faEye}
                            className="w-5 h-5"
                          />
                        </button>
                      </div>
                    </div>

                    <Button
                      variant="gold"
                      size="xl"
                      className="w-full !rounded-2xl mt-7"
                      disabled={loading}
                    >
                      {loading ? t("login.loading") : isSignup ? t("login.createAccountNow") : t("login.loginNow")}
                    </Button>

                    {/* Divider */}
                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className={`w-full border-t ${theme === "dark" ? "border-white/10" : "border-gray-200"}`} />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className={`px-4 ${theme === "dark" ? "bg-[#0D1B2A] text-gray-400" : "bg-white text-gray-500"} font-medium`}>
                          {t("login.orContinueWith")}
                        </span>
                      </div>
                    </div>

                    {/* Social Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        className={`flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border transition-all ${
                          theme === "dark"
                            ? "border-white/10 bg-[#112240] hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 text-white"
                            : "border-gray-200 bg-white hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 text-gray-700"
                        }`}
                      >
                        <FontAwesomeIcon icon={faApple} className="w-5 h-5" />
                        <span className="text-sm font-semibold">{t("login.apple")}</span>
                      </button>
                      <button
                        type="button"
                        className={`flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border transition-all ${
                          theme === "dark"
                            ? "border-white/10 bg-[#112240] hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 text-white"
                            : "border-gray-200 bg-white hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 text-gray-700"
                        }`}
                      >
                        <FontAwesomeIcon icon={faGoogle} className="w-5 h-5" />
                        <span className="text-sm font-semibold">{t("login.google")}</span>
                      </button>
                    </div>
                  </form>

                  <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                    <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      {isSignup ? t("login.alreadyHaveAccount") : t("login.dontHaveAccount")}
                      <button
                        onClick={() => setIsSignup(!isSignup)}
                        className="ml-2 font-bold text-[#D4AF37] hover:text-[#b8900f] transition-colors"
                      >
                        {isSignup ? t("login.signIn") : t("login.signUp")}
                      </button>
                    </p>

                    <Link
                      href="/terms"
                      className={`${theme === "dark" ? "text-gray-400 hover:text-[#D4AF37]" : "text-gray-500 hover:text-[#D4AF37]"} transition-colors font-semibold underline underline-offset-2`}
                    >
                      {t("login.terms")}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Side - Image */}
              <div className="relative bg-[#D4AF37]/20 hidden lg:block">
                <div className="relative h-full min-h-[500px] lg:min-h-[600px]">
                  {/* Background Image */}
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000&h=1200&fit=crop"
                    alt="Students collaborating"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A]/30 to-[#D4AF37]/40" />

                  {/* Decorative Elements */}
                  <div className="absolute top-8 right-8">
                    <button className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                      <FontAwesomeIcon icon={faXmark} className="w-5 h-5 text-[#0D1B2A]" />
                    </button>
                  </div>

                  {/* Floating Cards */}
                  <div className="absolute top-16 left-8 right-24">
                    <div className="bg-[#D4AF37] rounded-2xl p-4 shadow-2xl">
                      <p className="text-sm font-semibold text-[#0D1B2A]">
                        {t("login.smartLearning")}
                      </p>
                      <p className="text-xs text-[#0D1B2A]/70">
                        09:30 AM - 10:00 AM
                      </p>
                    </div>
                  </div>

                  <div className="absolute bottom-40 left-16 right-32">
                    <div className="bg-white rounded-2xl p-5 shadow-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-[#D4AF37]" />
                        <p className="font-semibold text-[#0D1B2A]">
                          {t("login.dailyMeeting")}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600">
                        12:00 PM - 01:00 PM
                      </p>
                    </div>
                  </div>

                  {/* Profile Avatars */}
                  <div className="absolute bottom-8 right-8">
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
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

