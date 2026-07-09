"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Clock,
  Heart,
  Laptop,
  Mail,
  Send,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { useMarketingHeroImage } from "@/hooks/useCmsImage";
import { useToast } from "@/context/ToastContext";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";
import { MarketingHeroMobileImage } from "@/components/marketing/MarketingHeroMobileImage";
import { StatGrid } from "@/components/premium/StatGrid";
import { hero } from "@/lib/premium/tokens";
import { cn } from "@/lib/utils";

const BENEFIT_ICONS = [Heart, Laptop, Users, Clock];
const STEP_ICONS = [Send, Users, Sparkles];
const STAT_ICONS = [Users, Briefcase, Zap, Heart];

type Job = {
  id?: string;
  title: string;
  description: string;
  type?: string;
  location?: string;
  highlights?: string[];
};

type Benefit = { title: string; description: string };
type Step = { title: string; description: string };
type Stat = { value: string; label: string };
type Faq = { question: string; answer: string };

export function CareersPageContent() {
  const mt = useMarketingTheme();
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const heroImage = useMarketingHeroImage();

  const jobs = useMemo(
    () => t("careersPage.jobs", { returnObjects: true }) as Job[],
    [t, i18n.language]
  );
  const benefits = useMemo(
    () => t("careersPage.benefits", { returnObjects: true }) as Benefit[],
    [t, i18n.language]
  );
  const steps = useMemo(
    () => t("careersPage.steps", { returnObjects: true }) as Step[],
    [t, i18n.language]
  );
  const stats = useMemo(
    () => t("careersPage.stats", { returnObjects: true }) as Stat[],
    [t, i18n.language]
  );
  const faqs = useMemo(
    () => t("careersPage.faqs", { returnObjects: true }) as Faq[],
    [t, i18n.language]
  );

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    experience: "",
    message: "",
  });

  const inputClass = cn(
    "w-full rounded-xl border px-4 py-3.5 text-sm transition-all focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20",
    mt.isDark
      ? "border-white/10 bg-[#0D1B2A] text-white placeholder:text-gray-500"
      : "border-gray-200 bg-white text-[#0D1B2A] placeholder:text-gray-400"
  );

  const statItems = (Array.isArray(stats) ? stats : []).map((stat, i) => ({
    number: stat.value,
    label: stat.label,
    icon: STAT_ICONS[i] ?? Users,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.subject.trim() ||
      !form.experience.trim() ||
      !form.message.trim()
    ) {
      toast.error(t("careersPage.validationRequired"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error(t("contact.validationEmail"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone,
          subject: t("careersPage.applicationSubject"),
          message: [
            `Fach / Rolle: ${form.subject}`,
            `Erfahrung: ${form.experience}`,
            "",
            form.message,
          ].join("\n"),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setSubmitted(true);
        toast.success(t("careersPage.applicationSuccess"));
      } else {
        toast.error(data.error || t("misc.errorGeneric"));
      }
    } catch {
      toast.error(t("misc.errorGeneric"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("marketing-page-root flex min-h-screen flex-col", mt.page)}>
      <Navbar />

      <main className="flex-1">
        <section className={cn("bg-[#0D1B2A] text-white", hero.section)}>
          <MarketingHeroBlend
            src={heroImage}
            alt=""
            variant="dark-split-right"
            backgroundColor="#0D1B2A"
            priority
          />
          <div className={hero.inner}>
            <div className="grid min-h-0 min-w-0 flex-1 items-center gap-12 lg:grid-cols-2">
              <div>
                <Badge variant="gold" className="mb-5" data-animate="hero-headline">
                  {t("careersPage.eyebrow")}
                </Badge>
                <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-[3.25rem]" data-animate="hero-headline" data-animate-delay="0.1">
                  {t("careersPage.title")}
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-on-navy-muted" data-animate="hero-subheadline">
                  {t("careersPage.subtitle")}
                </p>
                <p className="mt-3 max-w-xl text-sm text-on-navy-subtle" data-animate="hero-subheadline" data-animate-delay="0.2">
                  {t("careersPage.heroDesc")}
                </p>
                <div className="mt-8 flex flex-wrap gap-4" data-animate="hero-cta">
                  <Button variant="gold" size="lg" href="#positions">
                    {t("careersPage.viewPositions")}
                  </Button>
                  <Button
                    variant="onDark"
                    size="lg"
                    href="#apply"
                  >
                    {t("careersPage.applyNow")}
                  </Button>
                </div>
              </div>
              <div data-animate="hero-image">
                <MarketingHeroMobileImage src={heroImage} alt="" priority />
              </div>
            </div>
          </div>
        </section>

        {statItems.length > 0 && (
          <section className="-mt-8 relative z-10 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <StatGrid stats={statItems} variant="elevated" />
            </div>
          </section>
        )}

        <section className={cn("py-20", mt.sectionAlt)}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                {t("careersPage.whyEyebrow")}
              </p>
              <h2 className={cn("mt-3 text-3xl font-bold md:text-4xl", mt.heading)}>
                {t("careersPage.whyTitle")}
              </h2>
              <p className={cn("mt-4 text-lg", mt.body)}>{t("careersPage.whyDesc")}</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {(Array.isArray(benefits) ? benefits : []).map((item, i) => {
                const Icon = BENEFIT_ICONS[i] ?? Heart;
                return (
                  <Card key={item.title} className={cn("p-6", mt.card)}>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4AF37]/15">
                      <Icon className="h-6 w-6 text-[#D4AF37]" />
                    </div>
                    <h3 className={cn("font-bold", mt.heading)}>{item.title}</h3>
                    <p className={cn("mt-2 text-sm leading-relaxed", mt.body)}>{item.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section id="positions" className={cn("scroll-mt-24 py-20", mt.section)}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                {t("careersPage.positionsEyebrow")}
              </p>
              <h2 className={cn("mt-3 text-3xl font-bold md:text-4xl", mt.heading)}>
                {t("careersPage.positionsTitle")}
              </h2>
              <p className={cn("mt-4 max-w-2xl", mt.body)}>{t("careersPage.positionsDesc")}</p>
            </div>
            <div className="space-y-6">
              {(Array.isArray(jobs) ? jobs : []).map((job) => (
                <Card key={job.id ?? job.title} className={cn("overflow-hidden", mt.card)}>
                  <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-start md:p-8">
                    <div>
                      <h3 className={cn("text-2xl font-bold", mt.heading)}>{job.title}</h3>
                      {(job.type || job.location) && (
                        <p className="mt-2 text-sm font-medium text-[#D4AF37]">
                          {[job.type, job.location].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      <p className={cn("mt-4 leading-relaxed", mt.body)}>{job.description}</p>
                      {job.highlights && job.highlights.length > 0 && (
                        <ul className="mt-5 space-y-2">
                          {job.highlights.map((h) => (
                            <li key={h} className={cn("flex items-start gap-2 text-sm", mt.body)}>
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" />
                              {h}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Button variant="gold" href="#apply" className="shrink-0 self-start">
                      {t("careersPage.applyNow")}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className={cn("py-20", mt.sectionAlt)}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
                {t("careersPage.processEyebrow")}
              </p>
              <h2 className={cn("mt-3 text-3xl font-bold", mt.heading)}>{t("careersPage.processTitle")}</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {(Array.isArray(steps) ? steps : []).map((step, i) => {
                const Icon = STEP_ICONS[i] ?? Sparkles;
                return (
                  <Card key={step.title} className={cn("relative p-6", mt.card)}>
                    <span className="absolute right-4 top-4 text-4xl font-bold text-[#D4AF37]/15">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4AF37]/15">
                      <Icon className="h-6 w-6 text-[#D4AF37]" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                      {t("careersPage.stepLabel", { number: i + 1 })}
                    </p>
                    <h3 className={cn("mt-2 font-bold", mt.heading)}>{step.title}</h3>
                    <p className={cn("mt-2 text-sm leading-relaxed", mt.body)}>{step.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section id="apply" className={cn("scroll-mt-24 py-20", mt.section)}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <h2 className={cn("text-3xl font-bold", mt.heading)}>{t("careersPage.applicationTitle")}</h2>
                <p className={cn("mt-4 leading-relaxed", mt.body)}>{t("careersPage.applicationDesc")}</p>
                <Card className={cn("mt-8 p-6", mt.card)}>
                  <p className={cn("font-bold", mt.heading)}>{t("careersPage.supportTitle")}</p>
                  <p className={cn("mt-2 text-sm", mt.body)}>{t("careersPage.supportDesc")}</p>
                  <Link
                    href="mailto:support@nextgrades.de"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF37] hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    support@nextgrades.de
                  </Link>
                </Card>
              </div>

              <Card className={cn("lg:col-span-3 p-6 sm:p-8 lg:p-10", mt.card)}>
                {submitted ? (
                  <div className="py-12 text-center">
                    <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-[#22C55E]" />
                    <h3 className={cn("text-2xl font-bold", mt.heading)}>{t("careersPage.applicationSuccessTitle")}</h3>
                    <p className={cn("mt-3", mt.body)}>{t("careersPage.applicationSuccessMessage")}</p>
                  </div>
                ) : (
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className={cn("mb-2 block text-sm font-medium", mt.heading)}>
                          {t("contact.firstName")}
                        </label>
                        <input
                          type="text"
                          required
                          className={inputClass}
                          value={form.firstName}
                          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className={cn("mb-2 block text-sm font-medium", mt.heading)}>
                          {t("contact.lastName")}
                        </label>
                        <input
                          type="text"
                          required
                          className={inputClass}
                          value={form.lastName}
                          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className={cn("mb-2 block text-sm font-medium", mt.heading)}>
                          {t("contact.emailAddress")}
                        </label>
                        <input
                          type="email"
                          required
                          className={inputClass}
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className={cn("mb-2 block text-sm font-medium", mt.heading)}>
                          {t("contact.phoneNumber")}
                        </label>
                        <input
                          type="tel"
                          required
                          className={inputClass}
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={cn("mb-2 block text-sm font-medium", mt.heading)}>
                        {t("careersPage.fieldSubject")}
                      </label>
                      <input
                        type="text"
                        required
                        className={inputClass}
                        placeholder={t("careersPage.fieldSubjectPlaceholder")}
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={cn("mb-2 block text-sm font-medium", mt.heading)}>
                        {t("careersPage.fieldExperience")}
                      </label>
                      <input
                        type="text"
                        required
                        className={inputClass}
                        placeholder={t("careersPage.fieldExperiencePlaceholder")}
                        value={form.experience}
                        onChange={(e) => setForm({ ...form, experience: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={cn("mb-2 block text-sm font-medium", mt.heading)}>
                        {t("careersPage.fieldMessage")}
                      </label>
                      <textarea
                        required
                        rows={5}
                        className={cn(inputClass, "resize-none")}
                        placeholder={t("careersPage.fieldMessagePlaceholder")}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                      />
                    </div>
                    <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? t("contact.submitting") : t("careersPage.submitApplication")}
                      {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </section>

        {(Array.isArray(faqs) ? faqs : []).length > 0 && (
          <section className={cn("py-20", mt.sectionAlt)}>
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <h2 className={cn("mb-10 text-center text-3xl font-bold", mt.heading)}>
                {t("careersPage.faqTitle")}
              </h2>
              <div className="space-y-3">
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
                          "h-5 w-5 shrink-0 text-[#D4AF37] transition-transform",
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
            <h2 className="text-2xl font-bold md:text-3xl">{t("careersPage.ctaTitle")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-on-navy-muted">{t("careersPage.ctaDesc")}</p>
            <Button variant="gold" size="lg" href="#apply" className="mt-8">
              {t("careersPage.ctaButton")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
