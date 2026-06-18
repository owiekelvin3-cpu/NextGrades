"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { useCmsImage } from "@/hooks/useCmsImage";
import { useToast } from "@/context/ToastContext";
import { CONSULTATION_HERO_IMAGE } from "@/lib/marketing-images";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";
import { COMPANY_PHONE_DISPLAY, COMPANY_PHONE_TEL } from "@/lib/company";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  GraduationCap,
  MessageSquare,
  Shield,
  Sparkles,
  Target,
  Users,
  Video,
  ArrowRight,
  Phone,
  Mail,
} from "lucide-react";

const benefitIcons = [Target, Sparkles, Shield, GraduationCap, Clock, Users];
const stepIcons = [MessageSquare, Video, CheckCircle2, Calendar];
const audienceIcons = [GraduationCap, Users, Target];

type StepItem = { title: string; description: string };
type BenefitItem = { title: string; description: string };
type AudienceItem = { title: string; description: string };
type FaqItem = { question: string; answer: string };

export default function ConsultationPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const consultationHeroImage = useCmsImage("cmsImages.consultation.hero", CONSULTATION_HERO_IMAGE);

  const trustBadges = useLocalizedContent<string[]>("consultation.trustBadges");
  const steps = useLocalizedContent<StepItem[]>("consultation.steps");
  const benefits = useLocalizedContent<BenefitItem[]>("consultation.benefits");
  const audiences = useLocalizedContent<AudienceItem[]>("consultation.audiences");
  const faqs = useLocalizedContent<FaqItem[]>("consultation.faqs");
  const grades = useLocalizedContent<string[]>("consultation.grades");
  const subjects = useLocalizedContent<string[]>("consultation.subjects");
  const times = useLocalizedContent<string[]>("consultation.times");
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL;

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    grade: "",
    subject: "",
    preferredTime: "",
    goals: "",
  });

  const isDark = theme === "dark";
  const textPrimary = isDark ? "text-white" : "text-[#0D1B2A]";
  const textMuted = isDark ? "text-gray-400" : "text-gray-600";
  const cardBg = isDark ? "bg-[#112240] border-white/10" : "bg-white border-gray-100";
  const inputClass = `w-full px-4 py-3.5 rounded-xl border transition-all focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 ${
    isDark
      ? "border-white/10 bg-[#0D1B2A] text-white placeholder:text-gray-500"
      : "border-gray-200 bg-white text-[#0D1B2A] placeholder:text-gray-400"
  }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.grade ||
      !form.subject ||
      !form.preferredTime ||
      !form.goals.trim()
    ) {
      toast.error(t("consultation.validationRequired"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error(t("contact.validationEmail"));
      return;
    }

    const message = [
      form.goals.trim(),
      "",
      `Klasse / Niveau: ${form.grade}`,
      `Fach: ${form.subject}`,
      `Bevorzugte Zeit: ${form.preferredTime}`,
    ].join("\n");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone,
          message,
          subject: "Kostenlose Beratungsanfrage",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSubmitted(true);
        toast.success(t("consultation.successTitle"));
      } else {
        toast.error(data.error || t("misc.errorGeneric", { defaultValue: "Something went wrong." }));
      }
    } catch {
      toast.error(t("misc.errorGeneric", { defaultValue: "Something went wrong." }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`marketing-page-root min-h-screen flex flex-col ${isDark ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]"}`}>
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section
          className={`relative overflow-hidden pt-site-nav pb-16 md:pt-28 ${isDark ? "bg-[#0D1B2A] text-white" : "bg-white text-[#0D1B2A]"}`}
        >
          <MarketingHeroBlend
            src={consultationHeroImage}
            alt={t("consultation.title")}
            variant={isDark ? "dark-split-right" : "light-split-right"}
            backgroundColor={isDark ? "#0D1B2A" : "#FFFFFF"}
            priority
          />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                <p className={`uppercase tracking-[0.2em] text-sm font-semibold mb-4 ${textMuted}`}>
                  {t("consultation.heroEyebrow")}
                </p>
                <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${textPrimary}`}>
                  {t("consultation.title")}
                  <br />
                  <span className="text-[#D4AF37]">{t("consultation.titleHighlight")}</span>
                </h1>
                <p className={`text-lg mb-4 ${textMuted}`}>{t("consultation.subtitle")}</p>
                <p className={`text-base mb-8 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  {t("consultation.heroDesc")}
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {trustBadges.map((badge) => (
                    <Badge key={badge} variant="gold">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      {badge}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button variant="gold" size="lg" href="#book-consultation">
                    {t("consultation.bookNow")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    href="/programs"
                    className={isDark ? "border-white/20 text-white hover:bg-white/10" : ""}
                  >
                    {t("consultation.viewPrograms")}
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="relative hidden min-h-[400px] lg:block"
              >
                <div className="absolute bottom-0 right-0 z-10 max-w-xs p-4">
                  <Card
                    className={`p-6 backdrop-blur-md ${
                      isDark ? "border-white/20 bg-white/10 text-white" : "border-gray-200/80 bg-white/95 text-[#0D1B2A] shadow-xl"
                    }`}
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37]">
                        <Video className="h-5 w-5 text-[#0D1B2A]" />
                      </div>
                      <div>
                        <p className="font-semibold">{t("consultation.cardTitle")}</p>
                        <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                          {t("consultation.cardSubtitle")}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-4 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-[#D4AF37]" /> 30 min
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-[#D4AF37]" /> {trustBadges[1]}
                      </span>
                    </div>
                  </Card>
                </div>
              </motion.div>
            </div>

          </div>
        </section>

        {/* Process */}
        <section className={`py-20 ${isDark ? "bg-[#112240]/30" : "bg-[#FAFAFA]"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textPrimary}`}>{t("consultation.processTitle")}</h2>
              <p className={textMuted}>{t("consultation.processSubtitle")}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, i) => {
                const Icon = stepIcons[i] ?? Calendar;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className={`p-6 h-full relative overflow-hidden ${cardBg}`}>
                      <span className="absolute top-4 right-4 text-5xl font-bold text-[#D4AF37]/10">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-[#D4AF37]" />
                      </div>
                      <h3 className={`font-bold text-lg mb-2 ${textPrimary}`}>{step.title}</h3>
                      <p className={`text-sm ${textMuted}`}>{step.description}</p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className={`py-20 ${isDark ? "bg-[#0D1B2A]" : "bg-white"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textPrimary}`}>{t("consultation.benefitsTitle")}</h2>
              <p className={textMuted}>{t("consultation.benefitsSubtitle")}</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((item, i) => {
                const Icon = benefitIcons[i] ?? Sparkles;
                return (
                  <Card key={item.title} className={`p-6 ${cardBg}`}>
                    <div className="w-11 h-11 rounded-lg bg-[#D4AF37]/15 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <h3 className={`font-bold mb-2 ${textPrimary}`}>{item.title}</h3>
                    <p className={`text-sm ${textMuted}`}>{item.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Audience */}
        <section className={`py-16 ${isDark ? "bg-[#112240]/30" : "bg-[#FAFAFA]"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className={`text-2xl md:text-3xl font-bold text-center mb-10 ${textPrimary}`}>
              {t("consultation.audienceTitle")}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {audiences.map((item, i) => {
                const Icon = audienceIcons[i] ?? Users;
                return (
                  <Card key={item.title} className={`p-8 text-center ${cardBg}`}>
                    <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-[#D4AF37]" />
                    </div>
                    <h3 className={`font-bold text-lg mb-2 ${textPrimary}`}>{item.title}</h3>
                    <p className={`text-sm ${textMuted}`}>{item.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Booking form */}
        <section id="book-consultation" className={`py-20 scroll-mt-24 ${isDark ? "bg-[#0D1B2A]" : "bg-white"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-5 gap-10 items-start">
              <div className="lg:col-span-2 lg:sticky lg:top-28">
                <Badge variant="gold" className="mb-4">
                  {t("consultation.bookNow")}
                </Badge>
                <h2 className={`text-3xl font-bold mb-4 ${textPrimary}`}>{t("consultation.formTitle")}</h2>
                <p className={`mb-8 ${textMuted}`}>{t("consultation.formSubtitle")}</p>

                <ul className="space-y-4">
                  {[
                    { icon: Mail, text: "support@nextgrades.de", href: "mailto:support@nextgrades.de" },
                    { icon: Phone, text: COMPANY_PHONE_DISPLAY, href: COMPANY_PHONE_TEL },
                    { icon: Clock, text: t("consultation.responseTime") },
                  ].map(({ icon: Icon, text, href }) => (
                    <li key={text} className={`flex items-center gap-3 text-sm ${textMuted}`}>
                      <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                      {href ? (
                        <a href={href} className="font-medium hover:text-[#D4AF37]">
                          {text}
                        </a>
                      ) : (
                        text
                      )}
                    </li>
                  ))}
                </ul>

                {calendlyUrl && (
                  <Card className={`mt-8 overflow-hidden ${cardBg}`}>
                    <div className="p-4 border-b border-black/5 dark:border-white/10">
                      <h3 className={`font-bold ${textPrimary}`}>
                        {t("consultation.calendlyTitle", { defaultValue: "Book instantly with Calendly" })}
                      </h3>
                      <p className={`text-sm mt-1 ${textMuted}`}>
                        {t("consultation.calendlySubtitle", { defaultValue: "Pick a time that works for you." })}
                      </p>
                    </div>
                    <iframe
                      title="Calendly scheduling"
                      src={`${calendlyUrl}?hide_gdpr_banner=1`}
                      className="w-full h-[520px] border-0"
                    />
                  </Card>
                )}
              </div>

              <Card className={`lg:col-span-3 p-8 sm:p-10 ${cardBg}`}>
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className={`text-2xl font-bold mb-3 ${textPrimary}`}>{t("consultation.successTitle")}</h3>
                    <p className={`mb-8 ${textMuted}`}>{t("consultation.successMessage")}</p>
                    <Button variant="gold" href="/programs">
                      {t("consultation.ctaPrograms")}
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${textPrimary}`}>
                          {t("consultation.firstName")}
                        </label>
                        <input
                          required
                          type="text"
                          className={inputClass}
                          value={form.firstName}
                          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${textPrimary}`}>
                          {t("consultation.lastName")}
                        </label>
                        <input
                          required
                          type="text"
                          className={inputClass}
                          value={form.lastName}
                          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${textPrimary}`}>
                          {t("consultation.email")}
                        </label>
                        <input
                          required
                          type="email"
                          className={inputClass}
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${textPrimary}`}>
                          {t("consultation.phone")}
                        </label>
                        <input
                          required
                          type="tel"
                          className={inputClass}
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-5">
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${textPrimary}`}>
                          {t("consultation.gradeLevel")}
                        </label>
                        <select
                          required
                          className={inputClass}
                          value={form.grade}
                          onChange={(e) => setForm({ ...form, grade: e.target.value })}
                        >
                          <option value="">{t("consultation.gradePlaceholder")}</option>
                          {grades.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${textPrimary}`}>
                          {t("consultation.subject")}
                        </label>
                        <select
                          required
                          className={inputClass}
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        >
                          <option value="">{t("consultation.subjectPlaceholder")}</option>
                          {subjects.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${textPrimary}`}>
                          {t("consultation.preferredTime")}
                        </label>
                        <select
                          required
                          className={inputClass}
                          value={form.preferredTime}
                          onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                        >
                          <option value="">{t("consultation.timePlaceholder")}</option>
                          {times.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${textPrimary}`}>
                        {t("consultation.goals")}
                      </label>
                      <textarea
                        required
                        rows={4}
                        className={`${inputClass} resize-none`}
                        placeholder={t("consultation.goalsPlaceholder")}
                        value={form.goals}
                        onChange={(e) => setForm({ ...form, goals: e.target.value })}
                      />
                    </div>

                    <p className={`text-xs ${textMuted}`}>{t("consultation.privacyNote")}</p>

                    <Button variant="gold" size="xl" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? t("consultation.submitting") : t("consultation.submit")}
                      {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={`py-20 ${isDark ? "bg-[#112240]/30" : "bg-[#FAFAFA]"}`}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className={`text-3xl font-bold text-center mb-10 ${textPrimary}`}>{t("consultation.faqTitle")}</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <Card key={faq.question} className={`overflow-hidden ${cardBg}`}>
                  <button
                    type="button"
                    className={`w-full flex items-center justify-between p-5 text-left ${textPrimary}`}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <span className="font-semibold pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#D4AF37] shrink-0 transition-transform ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className={`px-5 pb-5 text-sm ${textMuted}`}
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-10 md:p-14 text-center bg-gradient-to-br from-[#0D1B2A] to-[#1a3a5c] border-0 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[#D4AF37]/5 pointer-events-none" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("consultation.ctaTitle")}</h2>
                <p className="text-gray-300 mb-8 max-w-xl mx-auto">{t("consultation.ctaDesc")}</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button variant="gold" size="lg" href="/programs">
                    {t("consultation.ctaPrograms")}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    href="/pricing"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    {t("consultation.ctaPricing")}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
