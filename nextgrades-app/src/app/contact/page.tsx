
"use client";

import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faPhone, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

export default function ContactPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 relative overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 h-40 ${theme === "dark" ? "bg-gradient-to-b from-[#0D1B2A] to-transparent" : "bg-gradient-to-b from-[#D4AF37]/20 to-transparent"}`} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="hidden lg:block relative h-[700px] rounded-3xl overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&h=1000&fit=crop"
                alt="Modern German building"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A]/20 to-[#D4AF37]/30" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`p-8 sm:p-12 lg:p-16 rounded-3xl shadow-2xl border ${
                theme === "dark"
                  ? "bg-[#112240] border-white/10"
                  : "bg-white border-white/20"
              }`}
            >
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37] flex items-center justify-center">
                    <span className="text-[#0D1B2A] font-bold text-xl">N</span>
                  </div>
                  <span className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                    NextGrades
                  </span>
                </div>

                <h1 className={`text-3xl sm:text-4xl font-bold mb-3 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                  {t("contact.title")}
                </h1>
                <p className={`mb-8 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  {t("contact.subtitle")}{" "}
                  <a 
                    href="mailto:support@nextgrades.de" 
                    className="text-[#D4AF37] font-semibold hover:underline"
                  >
                    support@nextgrades.de
                  </a>.
                </p>
              </div>

              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      {t("contact.firstName")}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder={t("contact.enterFirstName")}
                        className={`w-full pl-12 pr-5 py-4 rounded-full border transition-all ${
                          theme === "dark"
                            ? "border-white/10 bg-[#0D1B2A] text-white placeholder:text-gray-400"
                            : "border-gray-200 bg-white text-[#0D1B2A] placeholder:text-gray-400"
                        } focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      {t("contact.lastName")}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder={t("contact.enterLastName")}
                        className={`w-full pl-12 pr-5 py-4 rounded-full border transition-all ${
                          theme === "dark"
                            ? "border-white/10 bg-[#0D1B2A] text-white placeholder:text-gray-400"
                            : "border-gray-200 bg-white text-[#0D1B2A] placeholder:text-gray-400"
                        } focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20`}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    {t("contact.emailAddress")}
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t("contact.enterEmail")}
                      className={`w-full pl-12 pr-5 py-4 rounded-full border transition-all ${
                        theme === "dark"
                          ? "border-white/10 bg-[#0D1B2A] text-white placeholder:text-gray-400"
                          : "border-gray-200 bg-white text-[#0D1B2A] placeholder:text-gray-400"
                      } focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    {t("contact.phoneNumber")}
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/Flag_of_Germany.svg/1200px-Flag_of_Germany.svg.png"
                        alt="Germany flag"
                        className="w-5 h-4 object-cover rounded-sm"
                      />
                      <FontAwesomeIcon icon={faPhone} className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder={t("contact.enterPhone")}
                      className={`w-full pl-28 pr-12 py-4 rounded-full border transition-all ${
                        theme === "dark"
                          ? "border-white/10 bg-[#0D1B2A] text-white placeholder:text-gray-400"
                          : "border-gray-200 bg-white text-[#0D1B2A] placeholder:text-gray-400"
                      } focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    {t("contact.message")}
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t("contact.enterMessage")}
                      rows={4}
                      maxLength={300}
                      className={`w-full px-5 pt-4 pb-8 rounded-3xl border transition-all resize-none ${
                        theme === "dark"
                          ? "border-white/10 bg-[#0D1B2A] text-white placeholder:text-gray-400"
                          : "border-gray-200 bg-white text-[#0D1B2A] placeholder:text-gray-400"
                      } focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20`}
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                      {formData.message.length}/300
                    </div>
                  </div>
                </div>

                <Button
                  variant="gold"
                  size="xl"
                  className="w-full !rounded-full mt-2"
                >
                  {t("contact.submitForm")} <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
