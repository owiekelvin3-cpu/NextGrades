"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const { theme } = useTheme();

  return (
    <div className={cn("flex min-h-screen flex-col", theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]")}>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          <div
            className={cn(
              "rounded-3xl border p-8 shadow-xl sm:p-10",
              theme === "dark" ? "border-white/10 bg-[#112240]/90" : "border-gray-100 bg-white"
            )}
          >
            <div className="mb-8 text-center">
              <h1
                className={cn(
                  "text-3xl font-bold",
                  theme === "dark" ? "text-white" : "text-[#0D1B2A]"
                )}
              >
                Create your account
              </h1>
              <p className={cn("mt-2 text-sm", theme === "dark" ? "text-gray-400" : "text-gray-600")}>
                Join NextGrades in under a minute. You can add more profile details later in settings.
              </p>
            </div>
            <RegisterForm />
            <p className={cn("mt-6 text-center text-xs leading-relaxed", theme === "dark" ? "text-gray-500" : "text-gray-500")}>
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="font-semibold text-[#D4AF37] hover:opacity-90">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-semibold text-[#D4AF37] hover:opacity-90">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
