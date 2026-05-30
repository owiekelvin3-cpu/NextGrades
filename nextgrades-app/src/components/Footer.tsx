
"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "./BrandLogo";

export default function Footer() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <footer className={`pt-16 pb-8 ${theme === "dark" ? "bg-[#0D1B2A] text-white" : "bg-white text-[#0D1B2A] border-t border-gray-100"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          <div className="lg:col-span-2">
            <div className="mb-4">
              <BrandLogo />
            </div>
            <p className={`mb-4 max-w-md ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {t("login.smartLearning")}
            </p>
            <div className="flex items-center gap-3">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="h-8 w-auto rounded shadow-md object-cover"
              >
                <source src="/germany-flag.mp4" type="video/mp4" />
              </video>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{t("footer.madeInGermany")}</p>
            </div>
          </div>

          <div>
            <h4 className={`text-lg font-semibold mb-5 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>{t("footer.programs")}</h4>
            <ul className="space-y-3">
              <FooterLink href="/programs" theme={theme}>{t("footer.program1")}</FooterLink>
              <FooterLink href="/programs" theme={theme}>{t("footer.program2")}</FooterLink>
              <FooterLink href="/programs" theme={theme}>{t("footer.program3")}</FooterLink>
              <FooterLink href="/programs" theme={theme}>{t("footer.program4")}</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className={`text-lg font-semibold mb-5 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>{t("footer.resources")}</h4>
            <ul className="space-y-3">
              <FooterLink href="/resources" theme={theme}>{t("footer.resource1")}</FooterLink>
              <FooterLink href="/resources" theme={theme}>{t("footer.resource2")}</FooterLink>
              <FooterLink href="/resources" theme={theme}>{t("footer.resource3")}</FooterLink>
              <FooterLink href="/resources" theme={theme}>{t("footer.resource4")}</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className={`text-lg font-semibold mb-5 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>{t("footer.company")}</h4>
            <ul className="space-y-3">
              <FooterLink href="/about" theme={theme}>{t("common.about")}</FooterLink>
              <FooterLink href="/careers" theme={theme}>{t("common.careers")}</FooterLink>
              <FooterLink href="/contact" theme={theme}>{t("common.contact")}</FooterLink>
              <FooterLink href="/help" theme={theme}>{t("common.help")}</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className={`text-lg font-semibold mb-5 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>{t("footer.legal")}</h4>
            <ul className="space-y-3">
              <FooterLink href="/privacy" theme={theme}>{t("footer.privacy")}</FooterLink>
              <FooterLink href="/terms" theme={theme}>{t("footer.terms")}</FooterLink>
              <FooterLink href="/contact" theme={theme}>{t("footer.imprint")}</FooterLink>
            </ul>
          </div>
        </div>

        <div className={`border-t pt-8 ${theme === "dark" ? "border-white/10" : "border-gray-100"}`}>
          <p className={`text-sm text-center ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children, theme }: { href: string; children: React.ReactNode; theme: "dark" | "light" }) {
  return (
    <Link 
      href={href} 
      className={`transition-colors text-sm ${
        theme === "dark" 
          ? "text-gray-400 hover:text-[#D4AF37]" 
          : "text-gray-600 hover:text-[#D4AF37]"
      }`}
    >
      {children}
    </Link>
  );
}
