"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import {
  SUBJECT_OPTIONS,
  EDUCATION_LEVELS,
  GENDERS,
  EMAIL_REGEX,
  USERNAME_REGEX,
  PHONE_REGEX,
} from "@/lib/auth/registration";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Shield,
  User,
  GraduationCap,
  MapPin,
  AlertCircle,
} from "lucide-react";

const STEPS = [
  { id: "personal", label: "Personal", icon: User },
  { id: "contact", label: "Contact", icon: Mail },
  { id: "academic", label: "Academic", icon: GraduationCap },
  { id: "location", label: "Location", icon: MapPin },
  { id: "security", label: "Security", icon: Shield },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const initialForm = {
  firstName: "",
  lastName: "",
  middleName: "",
  username: "",
  gender: "",
  dateOfBirth: "",
  profilePicture: null as File | null,
  email: "",
  phone: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  schoolName: "",
  currentGrade: "",
  educationLevel: "",
  preferredSubjects: [] as string[],
  learningGoals: "",
  academicInterests: "",
  country: "",
  stateProvince: "",
  city: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
  otpCode: "",
};

export default function RegisterPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [emailExistsError, setEmailExistsError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const update = (field: keyof typeof form, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    if (field === "email") setEmailExistsError(false);
  };

  const calcStrength = (pwd: string) => {
    let s = 0;
    if (pwd.length >= 8) s += 25;
    if (pwd.length >= 12) s += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) s += 25;
    if (/\d/.test(pwd)) s += 15;
    if (/[^a-zA-Z\d]/.test(pwd)) s += 10;
    return Math.min(s, 100);
  };

  const checkEmailAvailable = useCallback(async (email: string) => {
    if (!EMAIL_REGEX.test(email)) return true;
    const res = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.exists) {
      setEmailExistsError(true);
      setErrors((e) => ({
        ...e,
        email: "An account with this email already exists. Please sign in to continue.",
      }));
      return false;
    }
    return true;
  }, []);

  const validateStep = (stepId: StepId): boolean => {
    const e: Record<string, string> = {};
    if (stepId === "personal") {
      if (!form.firstName.trim() || form.firstName.trim().length < 2) e.firstName = "First name is required";
      if (!form.lastName.trim() || form.lastName.trim().length < 2) e.lastName = "Last name is required";
      if (!USERNAME_REGEX.test(form.username)) e.username = "Username: 3–30 chars, letters, numbers, underscore";
      if (!form.gender) e.gender = "Select gender";
      if (!form.dateOfBirth) e.dateOfBirth = "Date of birth is required";
    }
    if (stepId === "contact") {
      if (!EMAIL_REGEX.test(form.email)) e.email = "Valid email required";
      if (!PHONE_REGEX.test(form.phone)) e.phone = "Valid phone number required";
      if (form.parentEmail && !EMAIL_REGEX.test(form.parentEmail)) e.parentEmail = "Invalid parent email";
    }
    if (stepId === "academic") {
      if (!form.schoolName.trim()) e.schoolName = "School name required";
      if (!form.currentGrade.trim()) e.currentGrade = "Grade/class required";
      if (!form.educationLevel) e.educationLevel = "Select education level";
      if (!form.preferredSubjects.length) e.preferredSubjects = "Select at least one subject";
      if (!form.learningGoals.trim()) e.learningGoals = "Learning goals required";
    }
    if (stepId === "location") {
      if (!form.country.trim()) e.country = "Country required";
      if (!form.stateProvince.trim()) e.stateProvince = "State/province required";
      if (!form.city.trim()) e.city = "City required";
    }
    if (stepId === "security") {
      if (form.password.length < 8) e.password = "Min 8 characters";
      else if (!/[a-z]/.test(form.password) || !/[A-Z]/.test(form.password) || !/\d/.test(form.password)) {
        e.password = "Include upper, lower, and a number";
      }
      if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords must match";
      if (!form.acceptTerms) e.acceptTerms = "Accept terms to continue";
      if (!otpVerified) e.otpCode = "Verify your email with the OTP code";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    const current = STEPS[step].id;
    if (!validateStep(current)) return;

    if (current === "contact") {
      setLoading(true);
      const ok = await checkEmailAvailable(form.email.trim().toLowerCase());
      setLoading(false);
      if (!ok) return;
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const sendOtp = async () => {
    if (!EMAIL_REGEX.test(form.email)) {
      setErrors((e) => ({ ...e, email: "Enter a valid email first" }));
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "EMAIL_EXISTS") {
          setEmailExistsError(true);
          setErrors((e) => ({ ...e, email: data.error }));
        } else {
          toast.error(data.error || "Failed to send code");
        }
        return;
      }
      setOtpSent(true);
      toast.success("Verification code sent to your email");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(form.otpCode)) {
      setErrors((e) => ({ ...e, otpCode: "Enter the 6-digit code" }));
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase(), code: form.otpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors((e) => ({ ...e, otpCode: data.error || "Invalid code" }));
        return;
      }
      setOtpVerified(true);
      toast.success("Email verified successfully");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep("security")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          middleName: form.middleName.trim() || undefined,
          username: form.username.trim(),
          gender: form.gender,
          dateOfBirth: form.dateOfBirth,
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          parentName: form.parentName.trim() || undefined,
          parentPhone: form.parentPhone.trim() || undefined,
          parentEmail: form.parentEmail.trim() || undefined,
          schoolName: form.schoolName.trim(),
          currentGrade: form.currentGrade.trim(),
          educationLevel: form.educationLevel,
          preferredSubjects: form.preferredSubjects,
          learningGoals: form.learningGoals.trim(),
          academicInterests: form.academicInterests.trim() || undefined,
          country: form.country.trim(),
          stateProvince: form.stateProvince.trim(),
          city: form.city.trim(),
          password: form.password,
          confirmPassword: form.confirmPassword,
          acceptTerms: form.acceptTerms,
          otpVerified: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "EMAIL_EXISTS") {
          setEmailExistsError(true);
          setErrors((e) => ({ ...e, email: data.error }));
        } else {
          toast.error(data.error || "Registration failed");
        }
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (!signInError && form.profilePicture) {
        const fd = new FormData();
        fd.append("file", form.profilePicture);
        await fetch("/api/profile/avatar", { method: "POST", body: fd });
      }

      setSuccess(true);
      toast.success("Welcome to NextGrades!");
      setTimeout(() => router.push("/dashboard/student"), 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (emailExistsError) {
      const t = setTimeout(() => router.push("/login"), 8000);
      return () => clearTimeout(t);
    }
  }, [emailExistsError, router]);

  const inputClass = cn(
    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20",
    theme === "dark"
      ? "border-white/15 bg-[#0D1B2A] text-white placeholder:text-gray-500"
      : "border-gray-200 bg-white text-[#0D1B2A] placeholder:text-gray-400"
  );

  const labelClass = cn("block text-sm font-medium mb-1.5", theme === "dark" ? "text-gray-200" : "text-gray-700");

  const stepContent = useMemo(() => {
    switch (STEPS[step].id) {
      case "personal":
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>First Name *</label>
              <input className={inputClass} value={form.firstName} onChange={(e) => update("firstName", e.target.value)} autoComplete="given-name" />
              {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
            </div>
            <div>
              <label className={labelClass}>Last Name *</label>
              <input className={inputClass} value={form.lastName} onChange={(e) => update("lastName", e.target.value)} autoComplete="family-name" />
              {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Middle Name (optional)</label>
              <input className={inputClass} value={form.middleName} onChange={(e) => update("middleName", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Username *</label>
              <input className={inputClass} value={form.username} onChange={(e) => update("username", e.target.value.toLowerCase())} autoComplete="username" />
              {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
            </div>
            <div>
              <label className={labelClass}>Gender *</label>
              <select className={inputClass} value={form.gender} onChange={(e) => update("gender", e.target.value)}>
                <option value="">Select…</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g.replace(/_/g, " ")}</option>
                ))}
              </select>
              {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender}</p>}
            </div>
            <div>
              <label className={labelClass}>Date of Birth *</label>
              <input type="date" className={inputClass} value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} />
              {errors.dateOfBirth && <p className="mt-1 text-xs text-red-500">{errors.dateOfBirth}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Profile Picture (optional)</label>
              <input type="file" accept="image/*" className={inputClass} onChange={(e) => update("profilePicture", e.target.files?.[0] || null)} />
            </div>
          </div>
        );
      case "contact":
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Email Address *</label>
              <input type="email" className={inputClass} value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              {emailExistsError && (
                <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <p className="text-sm text-amber-700 dark:text-amber-300">{errors.email}</p>
                  <Link href="/login" className="mt-2 inline-block text-sm font-semibold text-[#D4AF37] hover:underline">Go to Login →</Link>
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Phone Number *</label>
              <input type="tel" className={inputClass} value={form.phone} onChange={(e) => update("phone", e.target.value)} autoComplete="tel" />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>
            <div className="sm:col-span-2 border-t border-gray-200/20 pt-4">
              <p className={cn("text-sm font-medium mb-3", theme === "dark" ? "text-gray-300" : "text-gray-600")}>Parent/Guardian (optional, for younger students)</p>
            </div>
            <div>
              <label className={labelClass}>Parent/Guardian Name</label>
              <input className={inputClass} value={form.parentName} onChange={(e) => update("parentName", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Parent/Guardian Phone</label>
              <input className={inputClass} value={form.parentPhone} onChange={(e) => update("parentPhone", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Parent/Guardian Email</label>
              <input type="email" className={inputClass} value={form.parentEmail} onChange={(e) => update("parentEmail", e.target.value)} />
              {errors.parentEmail && <p className="mt-1 text-xs text-red-500">{errors.parentEmail}</p>}
            </div>
          </div>
        );
      case "academic":
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>School Name *</label>
              <input className={inputClass} value={form.schoolName} onChange={(e) => update("schoolName", e.target.value)} />
              {errors.schoolName && <p className="mt-1 text-xs text-red-500">{errors.schoolName}</p>}
            </div>
            <div>
              <label className={labelClass}>Current Class/Grade *</label>
              <input className={inputClass} value={form.currentGrade} onChange={(e) => update("currentGrade", e.target.value)} placeholder="e.g. 10th Grade" />
              {errors.currentGrade && <p className="mt-1 text-xs text-red-500">{errors.currentGrade}</p>}
            </div>
            <div>
              <label className={labelClass}>Education Level *</label>
              <select className={inputClass} value={form.educationLevel} onChange={(e) => update("educationLevel", e.target.value)}>
                <option value="">Select…</option>
                {EDUCATION_LEVELS.map((l) => (
                  <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                ))}
              </select>
              {errors.educationLevel && <p className="mt-1 text-xs text-red-500">{errors.educationLevel}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Preferred Subjects *</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {SUBJECT_OPTIONS.map((s) => {
                  const selected = form.preferredSubjects.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        update(
                          "preferredSubjects",
                          selected ? form.preferredSubjects.filter((x) => x !== s) : [...form.preferredSubjects, s]
                        )
                      }
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium border transition",
                        selected
                          ? "bg-[#D4AF37] text-[#0D1B2A] border-[#D4AF37]"
                          : theme === "dark"
                            ? "border-white/20 text-gray-300 hover:border-[#D4AF37]/50"
                            : "border-gray-200 text-gray-600 hover:border-[#D4AF37]"
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {errors.preferredSubjects && <p className="mt-1 text-xs text-red-500">{errors.preferredSubjects}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Learning Goals *</label>
              <textarea rows={3} className={inputClass} value={form.learningGoals} onChange={(e) => update("learningGoals", e.target.value)} placeholder="What do you want to achieve?" />
              {errors.learningGoals && <p className="mt-1 text-xs text-red-500">{errors.learningGoals}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Academic Interests (optional)</label>
              <textarea rows={2} className={inputClass} value={form.academicInterests} onChange={(e) => update("academicInterests", e.target.value)} />
            </div>
          </div>
        );
      case "location":
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Country *</label>
              <input className={inputClass} value={form.country} onChange={(e) => update("country", e.target.value)} autoComplete="country-name" />
              {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country}</p>}
            </div>
            <div>
              <label className={labelClass}>State/Province *</label>
              <input className={inputClass} value={form.stateProvince} onChange={(e) => update("stateProvince", e.target.value)} autoComplete="address-level1" />
              {errors.stateProvince && <p className="mt-1 text-xs text-red-500">{errors.stateProvince}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>City *</label>
              <input className={inputClass} value={form.city} onChange={(e) => update("city", e.target.value)} autoComplete="address-level2" />
              {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
            </div>
          </div>
        );
      case "security":
        return (
          <div className="space-y-5">
            <div className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-4">
              <p className={cn("text-sm font-medium mb-2", theme === "dark" ? "text-white" : "text-[#0D1B2A]")}>Email Verification (OTP) *</p>
              <p className="text-xs text-gray-500 mb-3">We&apos;ll send a 6-digit code to {form.email || "your email"}</p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={sendOtp} disabled={otpLoading || otpVerified}>
                  {otpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : otpSent ? "Resend Code" : "Send Code"}
                </Button>
                {otpVerified && (
                  <span className="inline-flex items-center gap-1 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" /> Verified</span>
                )}
              </div>
              {otpSent && !otpVerified && (
                <div className="mt-3 flex gap-2">
                  <input
                    className={cn(inputClass, "max-w-[180px]")}
                    placeholder="6-digit code"
                    value={form.otpCode}
                    onChange={(e) => update("otpCode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                  />
                  <Button type="button" variant="gold" onClick={verifyOtp} disabled={otpLoading}>Verify</Button>
                </div>
              )}
              {errors.otpCode && <p className="mt-1 text-xs text-red-500">{errors.otpCode}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Password *</label>
                <input
                  type="password"
                  className={inputClass}
                  value={form.password}
                  onChange={(e) => {
                    update("password", e.target.value);
                    setPasswordStrength(calcStrength(e.target.value));
                  }}
                  autoComplete="new-password"
                />
                <div className="mt-2 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full transition-all bg-[#D4AF37]" style={{ width: `${passwordStrength}%` }} />
                </div>
                <p className="mt-1 text-xs text-gray-500">Min 8 chars, upper & lower case, number</p>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>
              <div>
                <label className={labelClass}>Confirm Password *</label>
                <input type="password" className={inputClass} value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} autoComplete="new-password" />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.acceptTerms} onChange={(e) => update("acceptTerms", e.target.checked)} className="mt-1" />
              <span className={cn("text-sm", theme === "dark" ? "text-gray-300" : "text-gray-600")}>
                I accept the <Link href="/terms" className="text-[#D4AF37] hover:underline">Terms and Conditions</Link> and <Link href="/privacy" className="text-[#D4AF37] hover:underline">Privacy Policy</Link> *
              </span>
            </label>
            {errors.acceptTerms && <p className="text-xs text-red-500">{errors.acceptTerms}</p>}
          </div>
        );
      default:
        return null;
    }
  }, [step, form, errors, theme, emailExistsError, otpSent, otpVerified, otpLoading, passwordStrength, inputClass, labelClass]);

  if (success) {
    return (
      <div className={cn("min-h-screen flex flex-col", theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]")}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className={cn("text-2xl font-bold mb-2", theme === "dark" ? "text-white" : "text-[#0D1B2A]")}>Account Created!</h1>
            <p className="text-gray-500">Redirecting to your dashboard…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex flex-col", theme === "dark" ? "bg-[#0D1B2A]" : "bg-gradient-to-br from-[#FAFAFA] via-white to-[#D4AF37]/10")}>
      <Navbar />
      <main className="flex-1 py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className={cn("text-3xl font-bold mb-2", theme === "dark" ? "text-white" : "text-[#0D1B2A]")}>Create Student Account</h1>
            <p className="text-gray-500">Join NextGrades — step {step + 1} of {STEPS.length}</p>
          </div>

          <div className="flex justify-between mb-8 overflow-x-auto gap-2 pb-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              const done = i < step;
              return (
                <div key={s.id} className={cn("flex flex-col items-center min-w-[72px]", active ? "opacity-100" : "opacity-60")}>
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 mb-1",
                    done ? "bg-[#D4AF37] border-[#D4AF37] text-[#0D1B2A]" : active ? "border-[#D4AF37] text-[#D4AF37]" : "border-gray-300 text-gray-400"
                  )}>
                    {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className="text-xs font-medium">{s.label}</span>
                </div>
              );
            })}
          </div>

          <div className={cn("rounded-2xl border p-6 sm:p-8 shadow-lg", theme === "dark" ? "bg-[#112240] border-white/10" : "bg-white border-gray-100")}>
            {stepContent}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200/20">
              <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || loading}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button type="button" variant="gold" onClick={handleNext} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Next <ChevronRight className="h-4 w-4 ml-1" /></>}
                </Button>
              ) : (
                <Button type="button" variant="gold" onClick={handleSubmit} disabled={loading || !otpVerified}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                </Button>
              )}
            </div>
          </div>

          <p className="text-center mt-6 text-sm text-gray-500">
            Already have an account? <Link href="/login" className="text-[#D4AF37] font-semibold hover:underline">Sign in</Link>
          </p>
          <p className="text-center mt-2 text-sm text-gray-500">
            Are you a teacher? <Link href="/login?mode=signup" className="text-[#D4AF37] font-semibold hover:underline">Teacher registration</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
