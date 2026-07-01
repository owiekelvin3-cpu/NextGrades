"use client";

import { useEffect, useState } from "react";
import { BookOpen, Crown, Lock, LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase/client";
import { buildLoginUrl } from "@/lib/auth/redirect";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { ResourcesMarketplaceExperience } from "@/components/resources/ResourcesMarketplaceExperience";
import { SubjectBrowseGrid } from "@/components/resources/SubjectBrowseGrid";
import { section } from "@/lib/premium/tokens";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { cn } from "@/lib/utils";

type AccessState = "loading" | "granted" | "locked";

async function resolveLibraryAccess(): Promise<AccessState> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return "locked";

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, role")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profile?.role === "admin" || profile?.role === "teacher") return "granted";
  if (profile?.subscription_status === "active") return "granted";

  return "locked";
}

function ResourcesLibraryLocked() {
  const { t } = useTranslation();
  const mt = useMarketingTheme();
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string; slug?: string | null }>>([]);

  useEffect(() => {
    void fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.subjects)) setSubjects(data.subjects);
      });
  }, []);

  return (
    <section className={cn("py-12 md:py-16", mt.section)}>
      <div className={section.container}>
        <Card className={cn("overflow-hidden border-2 border-[var(--brand-gold)]/25", mt.card)}>
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="border-b border-[var(--border-default)] bg-[var(--surface-muted)]/60 p-8 text-center lg:border-b-0 lg:border-r lg:p-10">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-gold-muted)]">
                <BookOpen className="h-7 w-7 text-[var(--brand-gold)]" aria-hidden />
              </div>
              <p className="text-4xl font-bold tracking-tight text-[var(--foreground)] md:text-5xl">
                {t("resources.libraryGate.materialsCount")}
              </p>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-gold)]">
                {t("resources.libraryGate.materialsLabel")}
              </p>
            </div>

            <div className="p-8 lg:p-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-medium text-[var(--text-muted)]">
                <Lock className="h-3.5 w-3.5" aria-hidden />
                {t("resources.accessPremium")}
              </div>
              <h2 className="text-2xl font-bold text-[var(--foreground)] md:text-3xl">
                {t("resources.libraryGate.title")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)] md:text-base">
                {t("resources.libraryGate.subtitle")}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button variant="gold" size="md" href="/resources/upgrade" className="w-full sm:w-auto">
                  <Crown className="h-4 w-4" />
                  {t("resources.libraryGate.upgradeCta")}
                </Button>
                <Button variant="outline" size="md" href={buildLoginUrl("/resources")} className="w-full sm:w-auto">
                  <LogIn className="h-4 w-4" />
                  {t("resources.libraryGate.loginCta")}
                </Button>
                <Button variant="ghost" size="md" href="/pricing" className="w-full sm:w-auto">
                  {t("resources.libraryGate.pricingCta")}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {subjects.length > 0 ? (
          <SubjectBrowseGrid subjects={subjects} locked hideHeader className="mt-10" />
        ) : null}
      </div>
    </section>
  );
}

/** Full library catalog for members; marketing preview + upgrade path for guests. */
export function ResourcesLibraryGate() {
  const [access, setAccess] = useState<AccessState>("loading");

  useEffect(() => {
    let mounted = true;
    void resolveLibraryAccess().then((state) => {
      if (mounted) setAccess(state);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void resolveLibraryAccess().then((state) => {
        if (mounted) setAccess(state);
      });
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (access === "loading") {
    return (
      <section className="py-16">
        <div className={section.container}>
          <LoadingBlock />
        </div>
      </section>
    );
  }

  if (access === "granted") {
    return <ResourcesMarketplaceExperience />;
  }

  return <ResourcesLibraryLocked />;
}
