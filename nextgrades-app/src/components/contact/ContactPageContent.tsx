"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  Heart,
  Mail,
  MessageSquare,
  Phone,
  Send,
  TrendingUp,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";
import { MarketingHeroMobileImage } from "@/components/marketing/MarketingHeroMobileImage";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { useCmsImage } from "@/hooks/useCmsImage";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { useToast } from "@/context/ToastContext";
import { CONTACT_HERO_IMAGE } from "@/lib/marketing-images";
import {
  COMPANY_MAILTO,
  COMPANY_PHONE_DISPLAY,
  COMPANY_PHONE_TEL,
  COMPANY_SUPPORT_EMAIL,
} from "@/lib/company";
import { hero, type } from "@/lib/premium/tokens";
import { cn } from "@/lib/utils";

const BENEFIT_ICONS = [Heart, Users, BookOpen, TrendingUp];

const PROGRAM_OPTIONS = [
  { value: "1to1", labelKey: "footer.program1" },
  { value: "group", labelKey: "footer.program2" },
  { value: "math", labelKey: "footer.program3" },
  { value: "exam", labelKey: "footer.program4" },
  { value: "general", labelKey: "contact.subjectGeneral" },
] as const;

type Benefit = { title: string; description: string };
type Step = { title: string; description: string };
type Faq = { question: string; answer: string };

export function ContactPageContent() {
  const mt = useMarketingTheme();
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const contactHeroImage = useCmsImage("cmsImages.contact.hero", CONTACT_HERO_IMAGE);
  const consultationSubjects = useLocalizedContent<string[]>("consultation.subjects");
  const subjectOptions = Array.isArray(consultationSubjects) ? consultationSubjects : [];

  const benefits = useMemo(
    () => t("contact.benefits", { returnObjects: true }) as Benefit[],
    [t, i18n.language]
  );
  const steps = useMemo(
    () => t("contact.steps", { returnObjects: true }) as Step[],
    [t, i18n.language]
  );
  const faqs = useMemo(
    () => t("contact.faqs", { returnObjects: true }) as Faq[],
    [t, i18n.language]
  );

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    subject: "",
    email: "",
    phone: "",
    message: "",
  });

  const inputClass =
    "w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-background)] px-4 py-3.5 text-sm text-[var(--input-foreground)] transition-all placeholder:text-[var(--input-placeholder)] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-ring)]";

  const selectClass = cn(
    inputClass,
    "appearance-none bg-[length:1rem_1rem] bg-[right_1rem_center] bg-no-repeat pr-10",
    "bg-[image:var(--select-chevron)]"
  );

  const heroBg = mt.isDark ? "#0D1B2A" : "var(--background)";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error(t("contact.validationRequired"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      toast.error(t("contact.validationEmail"));
      return;
    }
    if (!privacyAccepted) {
      toast.error(t("contact.privacyRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      const subjectLine = formData.subject
        ? `${t("contact.formSubject")} — ${formData.subject}`
        : t("contact.formSubject");
      const messageBody = [
        formData.message.trim(),
        formData.subject ? `\n\n${t("contact.subject")}: ${formData.subject}` : "",
      ]
        .join("")
        .trim();

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: [formData.firstName, formData.lastName].filter(Boolean).join(" ").trim(),
          email: formData.email,
          phone: formData.phone,
          message: messageBody,
          subject: subjectLine,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setSubmitted(true);
        toast.success(t("contact.success"));
      } else {
        toast.error(data.error || t("misc.errorGeneric"));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("misc.errorGeneric"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("marketing-page-root flex min-h-screen flex-col", mt.page)}>
      <style>{`
        :root { --select-chevron: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238a7428' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); }
        .dark { --select-chevron: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23d4af37' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); }
      `}</style>

      <Navbar />

      <main className="flex-1 overflow-x-hidden">
        <section
          className={cn(
            hero.section,
            "relative overflow-hidden",
            mt.isDark ? "bg-[#0D1B2A] text-white" : mt.page
          )}
        >
          <MarketingHeroBlend
            src={contactHeroImage}
            alt={t("contact.heroImageAlt")}
            variant={mt.isDark ? "dark-split-right" : "light-split-right"}
            backgroundColor={heroBg}
            priority
          />
          <div className={hero.inner}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid min-w-0 items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              <div className="relative z-10 min-w-0 max-w-xl">
                <Badge variant="gold" className="mb-5">
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                  {t("contact.eyebrow")}
                </Badge>
                <h1
                  className={cn(
                    type.h1,
                    mt.isDark ? "text-white" : mt.heading
                  )}
                >
                  {t("contact.title")}
                </h1>
                <p
                  className={cn(
                    "mt-4 max-w-xl text-sm leading-relaxed md:mt-5 md:text-lg",
                    mt.isDark ? "text-on-navy-muted" : mt.body
                  )}
                >
                  {t("contact.subtitle")}{" "}
                  <a
                    href={COMPANY_MAILTO}
                    className="font-semibold text-[var(--brand-gold)] hover:underline"
                  >
                    {COMPANY_SUPPORT_EMAIL}
                  </a>
                </p>
                {t("contact.heroDesc") && (
                  <p
                    className={cn(
                      "mt-3 max-w-xl text-sm",
                      mt.isDark ? "text-on-navy-subtle" : mt.muted
                    )}
                  >
                    {t("contact.heroDesc")}
                  </p>
                )}
                <Button variant="gold" size="lg" href="#contact-form" className="mt-8">
                  {t("contact.heroCta")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <MarketingHeroMobileImage src={contactHeroImage} priority />
            </motion.div>
          </div>
        </section>

        <section className={cn("-mt-6 relative z-10 px-4 pb-4 sm:px-6 lg:px-8", mt.sectionAlt)}>
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(Array.isArray(benefits) ? benefits : []).map((item, i) => {
                const Icon = BENEFIT_ICONS[i] ?? Heart;
                return (
                  <Card key={item.title} className={cn("p-5 sm:p-6", mt.card)}>
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-gold-muted)]">
                      <Icon className="h-5 w-5 text-[var(--brand-gold)]" />
                    </div>
                    <h3 className={cn("font-bold", mt.heading)}>{item.title}</h3>
                    <p className={cn("mt-2 text-sm leading-relaxed", mt.body)}>{item.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section id="contact-form" className={cn("scroll-mt-24 py-16 md:py-20", mt.section)}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 md:mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--brand-gold)]">
                {t("contact.benefitsEyebrow")}
              </p>
              <h2 className={cn("mt-3 text-3xl font-bold md:text-4xl", mt.heading)}>
                {t("contact.formTitle")}
              </h2>
              <p className={cn("mt-4 max-w-2xl", mt.body)}>{t("contact.formDesc")}</p>
            </div>

            <div className="grid gap-10 lg:grid-cols-5">
              <Card className={cn("lg:col-span-3 p-6 sm:p-8 lg:p-10", mt.card)}>
                {submitted ? (
                  <div className="flex flex-col items-center py-16 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    </div>
                    <h3 className={cn("text-2xl font-bold", mt.heading)}>{t("contact.successTitle")}</h3>
                    <p className={cn("mt-3 max-w-md", mt.body)}>{t("contact.successMessage")}</p>
                    <Button variant="gold" href="/" className="mt-8">
                      {t("common.home")}
                    </Button>
                  </div>
                ) : (
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                      <p className={cn("mb-4 text-sm font-semibold", mt.heading)}>
                        {t("contact.sectionPersonal")}
                      </p>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className={cn("mb-2 block text-sm font-medium", mt.heading)}>
                            {t("contact.firstName")}
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            placeholder={t("contact.enterFirstName")}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={cn("mb-2 block text-sm font-medium", mt.heading)}>
                            {t("contact.lastNameOptional")}
                          </label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            placeholder={t("contact.enterLastName")}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={cn("mb-2 block text-sm font-medium", mt.heading)}>
                            {t("contact.emailAddress")}
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder={t("contact.enterEmail")}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={cn("mb-2 block text-sm font-medium", mt.heading)}>
                            {t("contact.phoneOptional")}
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder={t("contact.enterPhone")}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={cn("mb-2 flex items-center gap-2 text-sm font-medium", mt.heading)}>
                        <BookOpen className="h-4 w-4 text-[var(--brand-gold)]" aria-hidden />
                        {t("contact.subject")}
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className={selectClass}
                      >
                        <option value="">{t("contact.subjectPlaceholder")}</option>
                        <optgroup label={t("contact.subjectGroupSubjects")}>
                          {subjectOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label={t("contact.subjectGroupPrograms")}>
                          {PROGRAM_OPTIONS.map((opt) => (
                            <option key={opt.value} value={t(opt.labelKey)}>
                              {t(opt.labelKey)}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      <p className={cn("mt-1.5 text-xs", mt.muted)}>{t("contact.subjectHint")}</p>
                    </div>

                    <div>
                      <label className={cn("mb-2 block text-sm font-medium", mt.heading)}>
                        {t("contact.message")}
                      </label>
                      <div className="relative">
                        <textarea
                          required
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder={t("contact.enterMessage")}
                          rows={5}
                          maxLength={500}
                          className={cn(inputClass, "resize-none pb-8")}
                        />
                        <span className={cn("absolute bottom-3 right-3 text-xs", mt.muted)}>
                          {formData.message.length}/500
                        </span>
                      </div>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={privacyAccepted}
                        onChange={(e) => setPrivacyAccepted(e.target.checked)}
                        className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--input-border)] text-[var(--brand-gold)] focus:ring-[var(--brand-gold-ring)]"
                      />
                      <span className={cn("text-sm leading-relaxed", mt.body)}>
                        {t("contact.privacyAgree")}{" "}
                        <Link href="/privacy" className="font-semibold text-[var(--brand-gold)] hover:underline">
                          {t("login.privacy")}
                        </Link>
                        .
                      </span>
                    </label>

                    <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? t("contact.submitting") : t("contact.submitForm")}
                      {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
                    </Button>
                  </form>
                )}
              </Card>

              <div className="space-y-6 lg:col-span-2">
                <Card className={cn("p-6", mt.card)}>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--brand-gold)]">
                    {t("contact.processEyebrow")}
                  </p>
                  <h3 className={cn("mt-2 text-xl font-bold", mt.heading)}>{t("contact.processTitle")}</h3>
                  <ol className="mt-6 space-y-5">
                    {(Array.isArray(steps) ? steps : []).map((step, i) => (
                      <li key={step.title} className="flex gap-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-gold-muted)] text-sm font-bold text-[var(--brand-gold)]">
                          {i + 1}
                        </span>
                        <div className="min-w-0 pt-0.5">
                          <p className={cn("font-semibold", mt.heading)}>{step.title}</p>
                          <p className={cn("mt-1 text-sm leading-relaxed", mt.body)}>{step.description}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Card>

                <Card className={cn("p-6", mt.card)}>
                  <p className={cn("text-lg font-bold", mt.heading)}>{t("contact.supportTitle")}</p>
                  <p className={cn("mt-2 text-sm", mt.body)}>{t("contact.supportDesc")}</p>
                  <ul className="mt-5 space-y-4">
                    <li>
                      <a
                        href={COMPANY_MAILTO}
                        className="flex items-center gap-3 text-sm font-semibold transition-colors hover:text-[var(--brand-gold)]"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-gold-muted)]">
                          <Mail className="h-4 w-4 text-[var(--brand-gold)]" />
                        </span>
                        <span className={mt.heading}>{COMPANY_SUPPORT_EMAIL}</span>
                      </a>
                    </li>
                    <li>
                      <a
                        href={COMPANY_PHONE_TEL}
                        className="flex items-center gap-3 text-sm font-semibold transition-colors hover:text-[var(--brand-gold)]"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-gold-muted)]">
                          <Phone className="h-4 w-4 text-[var(--brand-gold)]" />
                        </span>
                        <span className={mt.heading}>{COMPANY_PHONE_DISPLAY}</span>
                      </a>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-gold-muted)]">
                        <Clock className="h-4 w-4 text-[var(--brand-gold)]" />
                      </span>
                      <div>
                        <p className={cn("font-semibold", mt.heading)}>{t("contact.hoursLabel")}</p>
                        <p className={cn("text-sm", mt.body)}>{t("contact.hoursValue")}</p>
                      </div>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {(Array.isArray(faqs) ? faqs : []).length > 0 && (
          <section className={cn("py-16 md:py-20", mt.sectionAlt)}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className={cn("mb-10 text-center text-3xl font-bold", mt.heading)}>
                {t("contact.faqTitle")}
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {faqs.map((faq, i) => (
                  <Card key={faq.question} className={cn("overflow-hidden", mt.card)}>
                    <button
                      type="button"
                      className={cn("flex w-full items-center justify-between p-5 text-left", mt.heading)}
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      aria-expanded={openFaq === i}
                    >
                      <span className="pr-4 font-semibold">{faq.question}</span>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 shrink-0 text-[var(--brand-gold)] transition-transform",
                          openFaq === i && "rotate-180"
                        )}
                      />
                    </button>
                    {openFaq === i && (
                      <div className={cn("px-5 pb-5 text-sm leading-relaxed", mt.body)}>{faq.answer}</div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D1B2A] via-[#132942] to-[#1a3555] p-8 text-center text-white sm:p-12">
            <p className="text-sm font-semibold text-[#D4AF37]">{t("contact.ctaEyebrow")}</p>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">{t("contact.ctaTitle")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-on-navy-muted">{t("contact.ctaDesc")}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button variant="gold" size="lg" href="/pricing">
                {t("common.pricing")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="onDark" size="lg" href="/consultation">
                {t("contact.ctaConsultation")}
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
