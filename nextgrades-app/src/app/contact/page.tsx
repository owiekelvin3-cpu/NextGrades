"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { useTranslation } from "react-i18next";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCmsImage } from "@/hooks/useCmsImage";
import { CONTACT_HERO_IMAGE } from "@/lib/marketing-images";

export default function ContactPage() {
  const mt = useMarketingTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const contactHeroImage = useCmsImage("cmsImages.contact.hero", CONTACT_HERO_IMAGE);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const inputClass = cn(
    "w-full rounded-xl border px-4 py-3.5 text-sm transition-all focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20",
    mt.isDark
      ? "border-white/10 bg-[#0D1B2A] text-white placeholder:text-gray-500"
      : "border-gray-200 bg-white text-[#0D1B2A] placeholder:text-gray-400"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error(t("contact.validationRequired"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      toast.error(t("contact.validationEmail"));
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          subject: "Contact form",
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setSubmitted(true);
        toast.success(t("contact.success", { defaultValue: "Message sent successfully!" }));
      } else {
        toast.error(data.error || t("misc.errorGeneric", { defaultValue: "Something went wrong." }));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("misc.errorGeneric", { defaultValue: "Something went wrong." }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactCards = [
    {
      icon: Mail,
      label: t("contact.emailAddress", { defaultValue: "Email" }),
      value: "support@nextgrades.de",
      href: "mailto:support@nextgrades.de",
      color: "bg-[#D4AF37]/15 text-[#D4AF37]",
    },
    {
      icon: Phone,
      label: t("contact.phoneNumber", { defaultValue: "Phone" }),
      value: "+49 (0) 30 1234 5678",
      href: "tel:+493012345678",
      color: "bg-[#4DA3FF]/15 text-[#4DA3FF]",
    },
    {
      icon: MapPin,
      label: t("contact.officeLabel", { defaultValue: "Office" }),
      value: t("contact.officeValue", { defaultValue: "Berlin, Germany" }),
      color: "bg-emerald-500/15 text-emerald-500",
    },
    {
      icon: Clock,
      label: t("contact.hoursLabel", { defaultValue: "Response time" }),
      value: t("contact.hoursValue", { defaultValue: "Within 24 hours" }),
      color: "bg-violet-500/15 text-violet-500",
    },
  ];

  return (
    <div className={cn("marketing-page-root min-h-screen flex flex-col", mt.page)}>
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#0D1B2A] pt-site-nav pb-20 text-white md:pt-28">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-[#D4AF37]/15 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#4DA3FF]/10 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-3xl text-center"
            >
              <Badge variant="gold" className="mb-5">
                <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                {t("common.contact")}
              </Badge>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                {t("contact.title")}
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-300">
                {t("contact.subtitle")}{" "}
                <a href="mailto:support@nextgrades.de" className="font-semibold text-[#D4AF37] hover:underline">
                  support@nextgrades.de
                </a>
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact cards + form */}
        <section className={cn("py-16 lg:py-20", mt.isDark ? "bg-[#0D1B2A]" : "bg-[#F5F6F8]")}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
              {/* Left — info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-5 space-y-6"
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {contactCards.map((item) => (
                    <Card key={item.label} className={cn("p-5", mt.card)}>
                      <div className="flex items-start gap-4">
                        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", item.color)}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className={cn("text-xs font-semibold uppercase tracking-wide", mt.muted)}>{item.label}</p>
                          {item.href ? (
                            <a
                              href={item.href}
                              className={cn("mt-1 block text-sm font-semibold hover:text-[#D4AF37]", mt.heading)}
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

                <div className="relative hidden overflow-hidden rounded-2xl lg:block lg:h-64">
                  <MarketingImage
                    src={contactHeroImage}
                    fallbackSrc={CONTACT_HERO_IMAGE}
                    alt=""
                    containerClassName="absolute inset-0"
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/90 via-[#0D1B2A]/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-sm font-semibold text-[#D4AF37]">
                      {t("contact.sideEyebrow", { defaultValue: "Premium support" })}
                    </p>
                    <p className="mt-1 text-lg font-bold">
                      {t("contact.sideTitle", { defaultValue: "We're here to help you succeed." })}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Right — form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-7"
              >
                <Card className={cn("overflow-hidden p-6 sm:p-8 lg:p-10", mt.card)}>
                  {submitted ? (
                    <div className="flex flex-col items-center py-16 text-center">
                      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#22C55E]/15">
                        <CheckCircle2 className="h-10 w-10 text-[#22C55E]" />
                      </div>
                      <h2 className={cn("text-2xl font-bold", mt.heading)}>{t("contact.successTitle")}</h2>
                      <p className={cn("mt-3 max-w-md", mt.body)}>{t("contact.successMessage")}</p>
                      <Button variant="gold" href="/" className="mt-8">
                        {t("common.home", { defaultValue: "Home" })}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-8">
                        <h2 className={cn("text-2xl font-bold", mt.heading)}>
                          {t("contact.formTitle", { defaultValue: "Send us a message" })}
                        </h2>
                        <p className={cn("mt-2 text-sm", mt.body)}>
                          {t("contact.formDesc", {
                            defaultValue: "Fill out the form and our team will get back to you shortly.",
                          })}
                        </p>
                      </div>

                      <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <div>
                            <label className={cn("mb-2 block text-sm font-medium", mt.heading)}>
                              {t("contact.firstName")} *
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
                              {t("contact.lastName")} *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              placeholder={t("contact.enterLastName")}
                              className={inputClass}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={cn("mb-2 block text-sm font-medium", mt.heading)}>
                            {t("contact.emailAddress")} *
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
                            {t("contact.phoneNumber")}
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
                            {t("contact.message")} *
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

        {/* Bottom CTAs */}
        <section className={cn("border-t py-14", mt.isDark ? "border-white/10 bg-[#112240]" : "border-gray-100 bg-white")}>
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center sm:flex-row sm:justify-between sm:text-left sm:px-6">
            <div>
              <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
                <Sparkles className="h-5 w-5 text-[#D4AF37]" />
                <span className={cn("text-sm font-semibold text-[#D4AF37]", mt.heading)}>
                  {t("contact.ctaEyebrow", { defaultValue: "Explore plans" })}
                </span>
              </div>
              <h2 className={cn("text-xl font-bold sm:text-2xl", mt.heading)}>
                {t("contact.ctaTitle", { defaultValue: "Looking for the right learning plan?" })}
              </h2>
              <p className={cn("mt-2 text-sm", mt.body)}>
                {t("contact.ctaDesc", { defaultValue: "Compare memberships and tutoring packages on our pricing page." })}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap justify-center gap-3">
              <Button variant="gold" href="/pricing">
                {t("common.pricing")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" href="/consultation" className={mt.isDark ? "border-white/20 text-white" : ""}>
                {t("consultation.bookNow", { defaultValue: "Free consultation" })}
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
