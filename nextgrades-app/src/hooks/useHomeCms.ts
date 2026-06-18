"use client";

import { useEffect, useState } from "react";
import type { CmsFaq, CmsTestimonial } from "@/lib/cms/types";

export function useHomeCms() {
  const [faqs, setFaqs] = useState<CmsFaq[]>([]);
  const [testimonials, setTestimonials] = useState<CmsTestimonial[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [faqRes, testRes] = await Promise.all([
          fetch("/api/cms/faqs"),
          fetch("/api/cms/testimonials"),
        ]);
        if (cancelled) return;
        if (faqRes.ok) {
          const data = (await faqRes.json()) as CmsFaq[];
          setFaqs(data.filter((f) => f.is_active !== false));
        }
        if (testRes.ok) {
          const data = (await testRes.json()) as CmsTestimonial[];
          setTestimonials(data.filter((t) => t.is_active !== false));
        }
      } catch {
        /* locale fallbacks used */
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { faqs, testimonials, loaded };
}
