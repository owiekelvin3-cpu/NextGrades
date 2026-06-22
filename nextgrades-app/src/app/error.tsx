"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/Button";

export default function Error({
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
    <main className="flex min-h-[calc(100vh-var(--site-nav-height))] flex-col items-center justify-center bg-[#0D1B2A] px-4 py-16 text-center text-white">
      <BrandLogo size="lg" linked={false} onDarkBackground />
      <h1 className="mt-8 text-2xl font-bold sm:text-3xl">Etwas ist schiefgelaufen</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-on-navy-subtle">
        Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut oder kehre zur Startseite
        zurück.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variant="gold" size="md" type="button" onClick={() => reset()}>
          Erneut versuchen
        </Button>
        <Button variant="onDark" size="md" href="/">
          Zur Startseite
        </Button>
      </div>
      <Link href="/contact" className="mt-6 text-sm text-gray-500 transition hover:text-[#D4AF37]">
        Support kontaktieren
      </Link>
    </main>
  );
}
