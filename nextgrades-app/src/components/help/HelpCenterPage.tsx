"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Rocket,
  User,
  CreditCard,
  BookOpen,
  GraduationCap,
  Settings,
  Search,
  FileText,
  ChevronRight,
  ChevronDown,
  Eye,
  Mail,
  CheckCircle2,
  Headphones,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MockupPageHero } from "@/components/mockup/MockupPageHero";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useCmsImage } from "@/hooks/useCmsImage";
import { HELP_HERO_IMAGE } from "@/lib/marketing-images";
import { section } from "@/lib/premium/tokens";

const CATEGORY_ICONS = [Rocket, User, CreditCard, BookOpen, GraduationCap, Settings];

type Category = {
  id: string;
  title: string;
  desc: string;
  articles: { title: string; href?: string }[];
};

type PopularArticle = { title: string; views: string };

export function HelpCenterPage() {
  const { t, i18n } = useTranslation();
  const heroImage = useCmsImage("cmsImages.help.hero", HELP_HERO_IMAGE);
  const [query, setQuery] = useState("");

  const categories = useMemo(
    () => t("helpPage.categories", { returnObjects: true }) as Category[],
    [t, i18n.language]
  );

  const popular = useMemo(
    () => t("helpPage.popular", { returnObjects: true }) as PopularArticle[],
    [t, i18n.language]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        articles: cat.articles.filter((a) => a.title.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.title.toLowerCase().includes(q) || cat.articles.length > 0);
  }, [categories, query]);

  return (
    <div className="marketing-page-root flex min-h-screen flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1">
        <MockupPageHero
          breadcrumbs={[
            { label: t("common.home"), href: "/" },
            { label: t("helpPage.title") },
          ]}
          title={
            <>
              {t("helpPage.title")}.{" "}
              <span className="text-[#D4AF37]">{t("helpPage.titleHighlight")}</span>
            </>
          }
          subtitle={t("helpPage.subtitle")}
          heroImage={heroImage}
        >
          <div className="relative mt-8 max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("helpPage.searchPlaceholder")}
              className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-sm shadow-sm transition focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
            />
          </div>
        </MockupPageHero>

        <section className="border-b border-gray-100 bg-white py-10">
          <div className={section.container}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {(Array.isArray(categories) ? categories : []).slice(0, 6).map((cat, i) => {
                const Icon = CATEGORY_ICONS[i] ?? BookOpen;
                return (
                  <a
                    key={cat.id}
                    href={`#${cat.id}`}
                    className="group rounded-2xl border border-gray-100 bg-[#FAF8F5] p-5 transition hover:border-[#D4AF37]/30 hover:shadow-md"
                  >
                    <Icon className="mb-3 h-6 w-6 text-[#D4AF37]" />
                    <p className="font-bold text-[#0D1B2A] group-hover:text-[#D4AF37]">{cat.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600">{cat.desc}</p>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <section className={`${section.pyCompact} bg-[#FAF8F5]`}>
          <div className={section.container}>
            <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
              <div>
                <h2 className="mb-8 text-2xl font-bold text-[#0D1B2A]">{t("helpPage.allCategories")}</h2>
                <div className="space-y-10">
                  {filtered.map((cat, i) => {
                    const Icon = CATEGORY_ICONS[i] ?? BookOpen;
                    return (
                      <div key={cat.id} id={cat.id}>
                        <div className="mb-4 flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/10">
                            <Icon className="h-6 w-6 text-[#D4AF37]" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-[#0D1B2A]">{cat.title}</h3>
                            <p className="mt-1 text-sm text-gray-600">{cat.desc}</p>
                          </div>
                        </div>
                        <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white">
                          {cat.articles.slice(0, 4).map((article) => (
                            <li key={article.title}>
                              <Link
                                href={article.href ?? "/contact"}
                                className="flex items-center justify-between gap-4 px-5 py-4 text-sm transition hover:bg-[#FAF8F5]"
                              >
                                <span className="flex items-center gap-3">
                                  <FileText className="h-4 w-4 shrink-0 text-[#D4AF37]" />
                                  <span className="font-medium text-[#0D1B2A]">{article.title}</span>
                                </span>
                                <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                        {cat.articles.length > 4 && (
                          <button
                            type="button"
                            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#4DA3FF]"
                          >
                            {t("helpPage.showAllArticles", { count: cat.articles.length })}
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
                <Card className="p-6">
                  <h3 className="font-bold text-[#0D1B2A]">{t("helpPage.popularTitle")}</h3>
                  <ul className="mt-4 space-y-3">
                    {(Array.isArray(popular) ? popular : []).map((item) => (
                      <li key={item.title}>
                        <Link
                          href="/contact"
                          className="flex items-start justify-between gap-2 text-sm transition hover:text-[#D4AF37]"
                        >
                          <span className="font-medium text-[#0D1B2A]">{item.title}</span>
                          <span className="flex shrink-0 items-center gap-1 text-xs text-gray-500">
                            <Eye className="h-3.5 w-3.5" />
                            {item.views}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="overflow-hidden bg-[#0D1B2A] p-6 text-white">
                  <h3 className="text-lg font-bold">{t("helpPage.supportTitle")}</h3>
                  <p className="mt-2 text-sm text-gray-400">{t("helpPage.supportDesc")}</p>
                  <ul className="mt-5 space-y-2">
                    {[1, 2, 3].map((n) => (
                      <li key={n} className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#D4AF37]" />
                        {t(`helpPage.supportPoint${n}`)}
                      </li>
                    ))}
                  </ul>
                  <Button variant="gold" href="/contact" className="mt-6 w-full">
                    {t("helpPage.contactCta")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Card>
              </aside>
            </div>
          </div>
        </section>

        <section className="border-t border-[#D4AF37]/20 bg-[#FFF8E7] py-10">
          <div className={`${section.container} flex flex-col items-center justify-between gap-6 sm:flex-row`}>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/15">
                <Headphones className="h-7 w-7 text-[#D4AF37]" />
              </div>
              <div>
                <p className="font-bold text-[#0D1B2A]">{t("helpPage.bannerTitle")}</p>
                <p className="text-sm text-gray-600">{t("helpPage.bannerDesc")}</p>
              </div>
            </div>
            <Button variant="gold" href="/contact">
              {t("helpPage.bannerCta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
