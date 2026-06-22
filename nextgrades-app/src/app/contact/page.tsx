"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";
import { MarketingHeroMobileImage } from "@/components/marketing/MarketingHeroMobileImage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { useToast } from "@/context/ToastContext";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hero, section, type } from "@/lib/premium/tokens";
import { useCmsImage } from "@/hooks/useCmsImage";
import { CONTACT_HERO_IMAGE } from "@/lib/marketing-images";
import { COMPANY_PHONE_DISPLAY, COMPANY_PHONE_TEL } from "@/lib/company";

const PROGRAM_OPTIONS = [
  { value: "1to1", labelKey: "footer.program1" },
  { value: "group", labelKey: "footer.program2" },
  { value: "math", labelKey: "footer.program3" },
  { value: "exam", labelKey: "footer.program4" },
  { value: "general", labelKey: "contact.subjectGeneral" },
] as const;

export default function ContactPage() {
  const mt = useMarketingTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const contactHeroImage = useCmsImage("cmsImages.contact.hero", CONTACT_HERO_IMAGE);
  const consultationSubjects = useLocalizedContent<string[]>("consultation.subjects");
  const subjectOptions = Array.isArray(consultationSubjects) ? consultationSubjects : [];

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    subject: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-background)] px-4 py-3.5 text-sm text-[var(--input-foreground)] transition-all placeholder:text-[var(--input-placeholder)] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-ring)]";

  const selectClass = cn(
    inputClass,
    "appearance-none bg-[length:1rem_1rem] bg-[right_1rem_center] bg-no-repeat pr-10",
    "bg-[image:var(--select-chevron)]"
  );

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

  const contactCards = [
    {
      icon: Mail,
      label: t("contact.emailAddress"),
      value: "support@nextgrades.at",
      href: "mailto:support@nextgrades.at",
      iconClass: "bg-[var(--brand-gold-muted)] text-[var(--brand-gold)]",
    },
    {
      icon: Phone,
      label: t("contact.phoneNumber"),
      value: COMPANY_PHONE_DISPLAY,
      href: COMPANY_PHONE_TEL,
      iconClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      icon: MapPin,
      label: t("contact.officeLabel"),
      value: t("contact.officeValue"),
      iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: Clock,
      label: t("contact.hoursLabel"),
      value: t("contact.hoursValue"),
      iconClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
  ];

  const heroBg = mt.isDark ? "#0D1B2A" : "var(--background)";

  return (
    <div className={cn("marketing-page-root flex min-h-screen flex-col", mt.page)}>
      <style>{`
        :root { --select-chevron: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238a7428' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); }
        .dark { --select-chevron: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23d4af37' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); }
      `}</style>

      <Navbar />

      <main className="flex-1 overflow-x-hidden">
        <section className={cn(hero.section, "relative overflow-hidden", mt.page)}>
          <MarketingHeroBlend
            src={contactHeroImage}
            alt=""
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
                  {t("common.contact")}
                </Badge>
                <h1 className={cn(type.h1, mt.heading)}>{t("contact.title")}</h1>
                <p className={cn("mt-4 max-w-xl text-sm leading-relaxed md:mt-5 md:text-lg", mt.body)}>
                  {t("contact.subtitle")}{" "}
                  <a
                    href="mailto:support@nextgrades.at"
                    className="font-semibold text-[var(--brand-gold)] hover:underline"
                  >
                    support@nextgrades.at
                  </a>
                </p>
              </div>
              <MarketingHeroMobileImage src={contactHeroImage} priority />
            </motion.div>
          </div>
        </section>

        <section className={cn("py-14 md:py-20", mt.sectionAlt)}>
          <div className={section.container}>
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6 lg:col-span-5"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {contactCards.map((item) => (
                    <Card key={item.label} className={cn("p-5", mt.card)}>
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                            item.iconClass
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className={cn("text-xs font-semibold uppercase tracking-wide", mt.muted)}>{item.label}</p>
                          {item.href ? (
                            <a
                              href={item.href}
                              className={cn("mt-1 block text-sm font-semibold hover:text-[var(--brand-gold)]", mt.heading)}
                            >
                              {item.value}
                            </a>
                          ) : (
                            <p className={cn("mt-1 text-sm font-semibold", mt.heading)}>{item.value}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card className={cn("hidden p-6 lg:block", mt.card)}>
                  <p className="text-sm font-semibold text-[var(--brand-gold)]">{t("contact.sideEyebrow")}</p>
                  <p className={cn("mt-2 text-lg font-bold", mt.heading)}>{t("contact.sideTitle")}</p>
                  <ul className="mt-5 space-y-3">
                    {[1, 2, 3, 4].map((n) => (
                      <li key={n} className={cn("flex items-start gap-2 text-sm", mt.body)}>
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-gold)]" />
                        {t(`contact.sidePoint${n}`)}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-7"
              >
                <Card className={cn("overflow-hidden p-6 sm:p-8 lg:p-10", mt.card)}>
                  {submitted ? (
                    <div className="flex flex-col items-center py-16 text-center">
                      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                      </div>
                      <h2 className={cn("text-2xl font-bold", mt.heading)}>{t("contact.successTitle")}</h2>
                      <p className={cn("mt-3 max-w-md", mt.body)}>{t("contact.successMessage")}</p>
                      <Button variant="gold" href="/" className="mt-8">
                        {t("common.home")}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-8">
                        <h2 className={cn("text-2xl font-bold", mt.heading)}>{t("contact.formTitle")}</h2>
                        <p className={cn("mt-2 text-sm", mt.body)}>{t("contact.formDesc")}</p>
                      </div>

                      <form className="space-y-5" onSubmit={handleSubmit}>
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
                            <optgroup label={t("contact.subjectGroupSubjects", { defaultValue: "Subjects" })}>
                              {subjectOptions.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label={t("contact.subjectGroupPrograms", { defaultValue: "Programs" })}>
                              {PROGRAM_OPTIONS.map((opt) => (
                                <option key={opt.value} value={t(opt.labelKey)}>
                                  {t(opt.labelKey)}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                          <p className={cn("mt-1.5 text-xs", mt.muted)}>
                            {t("contact.subjectHint", {
                              defaultValue: "Optional — helps us route your message to the right team.",
                            })}
                          </p>
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

                        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? (
                            t("contact.submitting")
                          ) : (
                            <>
                              {t("contact.submitForm")}
                              <Send className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </form>
                    </>
                  )}
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        <section className={cn("border-t py-14", mt.section, "border-[var(--border-default)]")}>
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center sm:flex-row sm:justify-between sm:text-left sm:px-6">
            <div>
              <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
                <Sparkles className="h-5 w-5 text-[var(--brand-gold)]" />
                <span className="text-sm font-semibold text-[var(--brand-gold)]">{t("contact.ctaEyebrow")}</span>
              </div>
              <h2 className={cn("text-xl font-bold sm:text-2xl", mt.heading)}>{t("contact.ctaTitle")}</h2>
              <p className={cn("mt-2 text-sm", mt.body)}>{t("contact.ctaDesc")}</p>
            </div>
            <div className="flex shrink-0 flex-wrap justify-center">
              <Button variant="gold" href="/pricing">
                {t("common.pricing")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
