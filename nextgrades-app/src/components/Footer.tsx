"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "./BrandLogo";
import { OpenCookieSettingsButton } from "@/components/cookies/OpenCookieSettingsButton";
import { useConsentOptional } from "@/context/ConsentContext";
import { section } from "@/lib/premium/tokens";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { href: "/programs", key: "common.programs" },
  { href: "/subjects", key: "common.subjects" },
  { href: "/resources", key: "common.resources" },
  { href: "/pricing", key: "common.pricing" },
  { href: "/about", key: "common.about" },
  { href: "/contact", key: "common.contact" },
] as const;

const legalLinks = [
  { href: "/privacy", key: "footer.privacy" },
  { href: "/terms", key: "footer.terms" },
  { href: "/contact", key: "footer.imprint" },
] as const;

export default function Footer() {
  const { t } = useTranslation();
  const consent = useConsentOptional();

  return (
    <footer className="border-t border-white/10 bg-[#0D1B2A] text-white">
      <div
        className={cn(
          section.container,
          "pb-[max(1rem,env(safe-area-inset-bottom))] pt-8 md:pt-9"
        )}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <BrandLogo size="md" href="/" onDarkBackground />
            <p className="max-w-xs text-sm text-gray-400">{t("footer.tagline")}</p>
          </div>

          <nav
            aria-label={t("footer.explore", { defaultValue: "Navigation" })}
            className="flex flex-wrap gap-x-4 gap-y-2 md:max-w-xl md:justify-end lg:gap-x-5"
          >
            {primaryLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-gray-300 transition-colors hover:text-[#D4AF37]"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 border-t border-white/10 pt-5 text-xs text-gray-500 sm:flex-row sm:justify-between">
          <p className="text-center sm:text-left">{t("footer.copyright")}</p>

          <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 sm:justify-end">
            {legalLinks.map((item, index) => (
              <span key={item.href + item.key} className="inline-flex items-center">
                {index > 0 && <span className="mx-2 text-white/20" aria-hidden>|</span>}
                <Link href={item.href} className="transition-colors hover:text-gray-300">
                  {t(item.key)}
                </Link>
              </span>
            ))}
            <span className="mx-2 hidden text-white/20 sm:inline" aria-hidden>|</span>
            {consent ? (
              <button
                type="button"
                onClick={consent.openPreferences}
                className="transition-colors hover:text-gray-300"
              >
                {t("footer.cookies")}
              </button>
            ) : (
              <OpenCookieSettingsButton className="text-xs text-gray-500 hover:text-gray-300" />
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
