
"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff, CheckCircle2, X, User, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher">("student");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-24 px-4 bg-gradient-to-br from-[#0D1B2A] to-[#112240]">
        <div className="w-full max-w-6xl">
          {/* Main Card */}
          <div className="bg-gradient-to-br from-white/90 to-[#D4AF37]/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="grid lg:grid-cols-2">
              {/* Left Side - Form */}
              <div className="p-8 sm:p-12 lg:p-16">
                <div className="max-w-md mx-auto">
                  <h1 className="text-3xl font-bold text-[#0D1B2A] mb-2">
                    {isSignup ? "Create an account" : "Welcome back"}
                  </h1>
                  <p className="text-gray-600 mb-8">
                    {isSignup ? "Sign up and get premium tutoring" : "Login to your NextGrades account"}
                  </p>

                  {/* Role Selection (for both) */}
                  {!isSignup && (
                    <div className="space-y-2 mb-7">
                      <label className="text-sm font-semibold text-gray-700">I am logging in as...</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setSelectedRole("student")}
                          className={`p-5 rounded-2xl border-2 transition-all text-left ${
                            selectedRole === "student"
                              ? "border-[#D4AF37] bg-[#D4AF37]/10"
                              : "border-gray-200 bg-white hover:border-[#D4AF37]/40"
                          }`}
                        >
                          <div className="w-12 h-12 rounded-full bg-[#0D1B2A]/10 flex items-center justify-center mb-3">
                            <User className="w-6 h-6 text-[#0D1B2A]" />
                          </div>
                          <h3 className="font-bold text-[#0D1B2A]">Student</h3>
                          <p className="text-xs text-gray-500 mt-1">Student login</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedRole("teacher")}
                          className={`p-5 rounded-2xl border-2 transition-all text-left ${
                            selectedRole === "teacher"
                              ? "border-[#D4AF37] bg-[#D4AF37]/10"
                              : "border-gray-200 bg-white hover:border-[#D4AF37]/40"
                          }`}
                        >
                          <div className="w-12 h-12 rounded-full bg-[#0D1B2A]/10 flex items-center justify-center mb-3">
                            <User className="w-6 h-6 text-[#0D1B2A]" />
                          </div>
                          <h3 className="font-bold text-[#0D1B2A]">Teacher</h3>
                          <p className="text-xs text-gray-500 mt-1">Teacher login</p>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Form */}
                  <form className="space-y-5">
                    {isSignup && (
                      <>
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Full name</label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                              <User className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              placeholder="Lisa Schmidt"
                              className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 transition-all text-[#0D1B2A]"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">I am a...</label>
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              type="button"
                              onClick={() => setSelectedRole("student")}
                              className={`p-5 rounded-2xl border-2 transition-all text-left ${
                                selectedRole === "student"
                                  ? "border-[#D4AF37] bg-[#D4AF37]/10"
                                  : "border-gray-200 bg-white hover:border-[#D4AF37]/40"
                              }`}
                            >
                              <div className="w-12 h-12 rounded-full bg-[#0D1B2A]/10 flex items-center justify-center mb-3">
                                <User className="w-6 h-6 text-[#0D1B2A]" />
                              </div>
                              <h3 className="font-bold text-[#0D1B2A]">Student</h3>
                              <p className="text-xs text-gray-500 mt-1">I want to learn</p>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedRole("teacher")}
                              className={`p-5 rounded-2xl border-2 transition-all text-left ${
                                selectedRole === "teacher"
                                  ? "border-[#D4AF37] bg-[#D4AF37]/10"
                                  : "border-gray-200 bg-white hover:border-[#D4AF37]/40"
                              }`}
                            >
                              <div className="w-12 h-12 rounded-full bg-[#0D1B2A]/10 flex items-center justify-center mb-3">
                                <User className="w-6 h-6 text-[#0D1B2A]" />
                              </div>
                              <h3 className="font-bold text-[#0D1B2A]">Teacher</h3>
                              <p className="text-xs text-gray-500 mt-1">I want to teach</p>
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Email</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <Mail className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          placeholder="lisa.schmidt@example.com"
                          className="w-full pl-12 pr-5 py-4 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 transition-all text-[#0D1B2A]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-gray-700">Password</label>
                        {!isSignup && (
                          <Link
                            href="/forgot-password"
                            className="text-sm font-semibold text-[#D4AF37] hover:text-[#b8900f] transition-colors"
                          >
                            Forgot?
                          </Link>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <Lock className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="w-full pl-12 pr-14 py-4 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 transition-all text-[#0D1B2A]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      variant="gold"
                      size="xl"
                      className="w-full !rounded-2xl mt-7"
                    >
                      {isSignup ? "Create account" : "Login now"}
                    </Button>

                    {/* Divider */}
                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500 font-medium">
                          or continue with
                        </span>
                      </div>
                    </div>

                    {/* Social Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border border-gray-200 bg-white hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-all"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#000000"
                            d="M12.152 6.348c0 .006 0 .012 0 .018 0 .733-.258 1.427-.742 1.959-.484.532-1.164.859-1.929.859-.765 0-1.445-.327-1.929-.859-.484-.532-.742-1.226-.742-1.959 0-.733.258-1.427.742-1.959.484-.532 1.164-.859 1.929-.859.765 0 1.445.327 1.929.859.484.532.742 1.226.742 1.959 0 .006 0 .012 0 .018z"
                          />
                        </svg>
                        <span className="text-sm font-semibold text-gray-700">Apple</span>
                      </button>
                      <button
                        type="button"
                        className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border border-gray-200 bg-white hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-all"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                          fill="#000000"
                          d="M21.35 10.042c0-7.667-6.235-13.822-13.904-13.822-7.669 0-13.904 6.155-13.904 13.822 0 6.691 5.349 12.322 12.773 13.618v-9.638H8.116v-3.982h3.19V9.88c0-3.162 1.879-4.903 4.757-4.903 1.374 0 2.816.245 2.816.245v3.107H16.1c-1.56 0-2.045.972-2.045 1.963v2.371h3.474l-.554 3.982h-2.92v9.638c7.424-1.296 12.903-6.927 12.903-13.618z"
                          />
                        </svg>
                        <span className="text-sm font-semibold text-gray-700">Google</span>
                      </button>
                    </div>
                  </form>

                  <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                    <p className="text-gray-500">
                      {isSignup ? "Already have an account?" : "Don't have an account?"}
                      <button
                        onClick={() => setIsSignup(!isSignup)}
                        className="ml-2 font-bold text-[#D4AF37] hover:text-[#b8900f] transition-colors"
                      >
                        {isSignup ? "Sign in" : "Sign up"}
                      </button>
                    </p>

                    <Link
                      href="/terms"
                      className="text-gray-500 hover:text-[#D4AF37] transition-colors font-semibold underline underline-offset-2"
                    >
                      Terms & Conditions
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
                      <X className="w-5 h-5 text-[#0D1B2A]" />
                    </button>
                  </div>

                  {/* Floating Cards */}
                  <div className="absolute top-16 left-8 right-24">
                    <div className="bg-[#D4AF37] rounded-2xl p-4 shadow-2xl">
                      <p className="text-sm font-semibold text-[#0D1B2A]">
                        Smart Learning, Better Results.
                      </p>
                      <p className="text-xs text-[#0D1B2A]/70">
                        09:30 AM - 10:00 AM
                      </p>
                    </div>
                  </div>

                  <div className="absolute bottom-40 left-16 right-32">
                    <div className="bg-white rounded-2xl p-5 shadow-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                        <p className="font-semibold text-[#0D1B2A]">
                          Daily Meeting
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

