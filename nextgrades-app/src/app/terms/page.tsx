"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTheme } from "@/context/ThemeContext";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "react-i18next";

export default function TermsPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className={`text-4xl font-bold text-center mb-4 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
            {t("terms.title")}
          </h1>
          <p className={`text-xl text-center mb-12 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            {t("terms.subtitle")}
          </p>

          <Card className="p-8">
            <div className={`max-w-none ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              <p>{t("terms.body")}</p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
