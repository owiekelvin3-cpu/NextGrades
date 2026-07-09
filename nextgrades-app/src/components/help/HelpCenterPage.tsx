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
import { useMarketingHeroImage } from "@/hooks/useCmsImage";
import { section } from "@/lib/premium/tokens";
import { cn } from "@/lib/utils";
import { useMarketingTheme } from "@/lib/marketing-theme";

const CATEGORY_ICONS = [Rocket, User, CreditCard, BookOpen, GraduationCap, Settings];

type Category = {
  id: string;
  title: string;
  desc: string;
  articles: { title: string; answer?: string; href?: string }[];
};

type PopularArticle = { title: string; views: string; answer?: string };

function articleKey(categoryId: string, title: string) {
  return `${categoryId}::${title}`;
}

export function HelpCenterPage() {
  const { t, i18n } = useTranslation();
  const mt = useMarketingTheme();
  const heroImage = useMarketingHeroImage();
  const [query, setQuery] = useState("");
  const [openArticle, setOpenArticle] = useState<string | null>(null);
  const [openPopular, setOpenPopular] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set());

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
    <div className={cn("marketing-page-root flex min-h-screen flex-col", mt.page)}>
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
        />

        <section className={cn("border-b border-[var(--border-default)] py-8", mt.section)}>
          <div className={section.container}>
            <div className="relative mx-auto max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-subtle)]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("helpPage.searchPlaceholder")}
                className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-background)] py-4 pl-12 pr-4 text-sm text-[var(--input-foreground)] shadow-sm transition focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-ring)]"
              />
            </div>
          </div>
        </section>

        <section className={cn("border-b border-[var(--border-default)] py-10", mt.section)}>
          <div className={section.container}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {(Array.isArray(categories) ? categories : []).slice(0, 6).map((cat, i) => {
                const Icon = CATEGORY_ICONS[i] ?? BookOpen;
                return (
                  <a
                    key={cat.id}
                    href={`#${cat.id}`}
                    className={cn(
                      "group rounded-2xl border border-[var(--border-default)] bg-[var(--surface-muted)] p-5 transition hover:border-[var(--brand-gold)]/30 hover:shadow-md"
                    )}
                  >
                    <Icon className="mb-3 h-6 w-6 text-[var(--brand-gold)]" />
                    <p className="font-bold text-[var(--foreground)] group-hover:text-[var(--brand-gold)]">{cat.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{cat.desc}</p>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <section className={cn(section.pyCompact, mt.sectionAlt)}>
          <div className={section.container}>
            <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
              <div>
                <h2 className="mb-8 text-2xl font-bold text-[var(--foreground)]">{t("helpPage.allCategories")}</h2>
                <div className="space-y-10">
                  {filtered.map((cat, i) => {
                    const Icon = CATEGORY_ICONS[i] ?? BookOpen;
                    return (
                      <div key={cat.id} id={cat.id}>
                        <div className="mb-4 flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--brand-gold-muted)]">
                            <Icon className="h-6 w-6 text-[var(--brand-gold)]" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-[var(--foreground)]">{cat.title}</h3>
                            <p className="mt-1 text-sm text-[var(--text-muted)]">{cat.desc}</p>
                          </div>
                        </div>
                        <ul className="divide-y divide-[var(--border-default)] overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--card-background)]">
                          {(expandedCategories.has(cat.id) ? cat.articles : cat.articles.slice(0, 4)).map(
                            (article) => {
                              const key = articleKey(cat.id, article.title);
                              const isOpen = openArticle === key;
                              const content = article.answer?.trim() || t("helpPage.articleFallback");

                              if (article.href && !article.answer) {
                                return (
                                  <li key={article.title}>
                                    <Link
                                      href={article.href}
                                      className="flex items-center justify-between gap-4 px-5 py-4 text-sm transition hover:bg-[var(--surface-muted)]"
                                    >
                                      <span className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 shrink-0 text-[var(--brand-gold)]" />
                                        <span className="font-medium text-[var(--foreground)]">{article.title}</span>
                                      </span>
                                      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-subtle)]" />
                                    </Link>
                                  </li>
                                );
                              }

                              return (
                                <li key={article.title}>
                                  <button
                                    type="button"
                                    onClick={() => setOpenArticle(isOpen ? null : key)}
                                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm transition hover:bg-[var(--surface-muted)] touch-manipulation"
                                    aria-expanded={isOpen}
                                  >
                                    <span className="flex items-center gap-3">
                                      <FileText className="h-4 w-4 shrink-0 text-[var(--brand-gold)]" />
                                      <span className="font-medium text-[var(--foreground)]">{article.title}</span>
                                    </span>
                                    <ChevronDown
                                      className={cn(
                                        "h-4 w-4 shrink-0 text-[var(--text-subtle)] transition-transform",
                                        isOpen && "rotate-180"
                                      )}
                                    />
                                  </button>
                                  {isOpen && (
                                    <div className="border-t border-[var(--border-default)] px-5 pb-4 pt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                                      {content}
                                    </div>
                                  )}
                                </li>
                              );
                            }
                          )}
                        </ul>
                        {cat.articles.length > 4 && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedCategories((prev) => {
                                const next = new Set(prev);
                                if (next.has(cat.id)) next.delete(cat.id);
                                else next.add(cat.id);
                                return next;
                              })
                            }
                            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#4DA3FF]"
                          >
                            {expandedCategories.has(cat.id)
                              ? t("helpPage.showFewerArticles")
                              : t("helpPage.showAllArticles", { count: cat.articles.length })}
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform",
                                expandedCategories.has(cat.id) && "rotate-180"
                              )}
                            />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
                <Card className="p-6">
                  <h3 className="font-bold text-[var(--foreground)]">{t("helpPage.popularTitle")}</h3>
                  <ul className="mt-4 space-y-1">
                    {(Array.isArray(popular) ? popular : []).map((item) => {
                      const isOpen = openPopular === item.title;
                      const content = item.answer?.trim() || t("helpPage.articleFallback");
                      return (
                        <li key={item.title} className="overflow-hidden rounded-xl border border-[var(--border-default)]">
                          <button
                            type="button"
                            onClick={() => setOpenPopular(isOpen ? null : item.title)}
                            className="flex w-full items-start justify-between gap-2 px-3 py-3 text-left text-sm transition hover:bg-[var(--surface-muted)] touch-manipulation"
                            aria-expanded={isOpen}
                          >
                            <span className="font-medium text-[var(--foreground)]">{item.title}</span>
                            <span className="flex shrink-0 items-center gap-1 text-xs text-[var(--text-muted)]">
                              <Eye className="h-3.5 w-3.5" />
                              {item.views}
                              <ChevronDown
                                className={cn(
                                  "h-3.5 w-3.5 transition-transform",
                                  isOpen && "rotate-180"
                                )}
                              />
                            </span>
                          </button>
                          {isOpen && (
                            <div className="border-t border-[var(--border-default)] px-3 pb-3 pt-2 text-xs leading-relaxed text-[var(--text-muted)]">
                              {content}
                            </div>
                          )}
                        </li>
                      );
                    })}
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

        <section className="border-t border-white/10 bg-[#0D1B2A] py-10 text-white">
          <div className={`${section.container} flex flex-col items-center justify-between gap-6 sm:flex-row`}>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/15">
                <Headphones className="h-7 w-7 text-[#D4AF37]" />
              </div>
              <div>
                <p className="font-bold text-white">{t("helpPage.bannerTitle")}</p>
                <p className="text-sm text-gray-400">{t("helpPage.bannerDesc")}</p>
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
