"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#0D1B2A] px-4 text-white">
        <BrandLogo size="lg" linked={false} onDarkBackground />
        <h1 className="mt-8 text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 max-w-md text-center text-sm text-gray-400">
          An unexpected error occurred. Please try again or return to the homepage.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-[#D4AF37] px-6 py-3 text-sm font-bold text-[#0D1B2A] hover:opacity-90"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold hover:bg-white/10"
          >
            Back to Homepage
          </Link>
        </div>
      </body>
    </html>
  );
}
