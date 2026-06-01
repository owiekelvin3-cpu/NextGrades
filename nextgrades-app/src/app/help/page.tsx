"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTheme } from "@/context/ThemeContext";
import { Card } from "@/components/ui/Card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();

  const faqs = useMemo(
    () => t("help.faqs", { returnObjects: true }) as { question: string; answer: string }[],
    [t, i18n.language]
  );

  return (
    <div
      className={`min-h-screen flex flex-col ${
        theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]"
      }`}
    >
      <Navbar />
      <main className="flex-1 pt-site-nav pb-16 md:pt-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className={`text-4xl font-bold text-center mb-4 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
            {t("help.title")}
          </h1>
          <p className={`text-xl text-center mb-12 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            {t("help.subtitle")}
          </p>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full text-left flex items-center justify-between"
                >
                  <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                    {faq.question}
                  </h3>
                  {openIndex === index ? (
                    <ChevronUp className="w-6 h-6 text-[#D4AF37]" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-[#D4AF37]" />
                  )}
                </button>
                {openIndex === index && (
                  <p className={`mt-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{faq.answer}</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
