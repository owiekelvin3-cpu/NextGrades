"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/context/ToastContext";

export function FooterNewsletter() {
  const { t } = useTranslation();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error(t("contact.validationEmail", { defaultValue: "Please enter a valid email address." }));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Newsletter",
          email: trimmed,
          subject: "Newsletter",
          message: "Please add this address to the NextGrades newsletter list.",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || t("misc.errorGeneric", { defaultValue: "Something went wrong." }));
      }
      toast.success(t("footer.newsletterSuccess", { defaultValue: "Thanks — you're on the list!" }));
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("misc.errorGeneric", { defaultValue: "Something went wrong." }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-start gap-2">
        <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-gold)]" aria-hidden />
        <p className="text-sm leading-relaxed text-[var(--footer-muted)]">
          {t("footer.newsletterDesc", {
            defaultValue: "Stay up to date on programs, learning tips, and news from NextGrades.",
          })}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="sr-only" htmlFor="footer-newsletter-email">
          {t("footer.newsletterPlaceholder", { defaultValue: "Enter your e-mail address" })}
        </label>
        <input
          id="footer-newsletter-email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("footer.newsletterPlaceholder", { defaultValue: "Enter your e-mail address" })}
          className="footer-newsletter-input"
          disabled={loading}
        />
        <button type="submit" className="footer-newsletter-btn w-full sm:w-auto" disabled={loading}>
          {loading
            ? t("misc.sending", { defaultValue: "Sending…" })
            : t("footer.newsletterCta", { defaultValue: "Sign Up" })}
        </button>
      </form>
    </div>
  );
}
