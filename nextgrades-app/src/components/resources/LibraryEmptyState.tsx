"use client";

import Link from "next/link";
import { BookOpen, Crown, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { theme as th } from "@/lib/theme/tokens";
import { cn } from "@/lib/utils";

type Props = {
  searching?: boolean;
  query?: string;
};

export function LibraryEmptyState({ searching, query }: Props) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--card-background)] px-6 py-12 text-center sm:px-10 sm:py-14">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-gold-muted)]">
        <BookOpen className="h-7 w-7 text-[var(--brand-gold)]" strokeWidth={1.75} />
      </div>
      <h3 className="text-lg font-bold text-[var(--foreground)] sm:text-xl">
        {searching ? t("resources.noSearchResults") : t("resources.emptyLibraryTitle")}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
        {searching
          ? t("resources.noSearchResultsDesc", { query: query ?? "" })
          : t("resources.emptyLibraryDesc")}
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button variant="gold" size="md" href="/resources/upgrade" className="w-full sm:w-auto">
          <Crown className="mr-2 h-4 w-4" />
          {t("resources.ctaButton")}
        </Button>
        <Link
          href="/consultation"
          className={cn(th.btnOutline, th.focusRing, "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm sm:w-auto")}
        >
          {t("resources.emptyLibraryConsultation")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
