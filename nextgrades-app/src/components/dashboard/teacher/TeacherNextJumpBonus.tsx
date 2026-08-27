"use client";

import { useEffect, useState } from "react";
import { Rocket } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { TeacherDashboardLayout } from "./TeacherDashboardLayout";
import { teacherPanel } from "./teacher-ui";

export function TeacherNextJumpBonus() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [bonusLevel, setBonusLevel] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/teacher/earnings");
        const json = (await res.json()) as { summary?: { bonusLevel?: number } };
        if (!cancelled && res.ok) {
          setBonusLevel(Number(json.summary?.bonusLevel ?? 1));
        }
      } catch {
        /* optional */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <TeacherDashboardLayout title={t("teacherDashboard.nav.nextJumpBonus")}>
        <LoadingBlock />
      </TeacherDashboardLayout>
    );
  }

  return (
    <TeacherDashboardLayout title={t("teacherDashboard.nav.nextJumpBonus")}>
      <div className="mx-auto max-w-xl">
        <div className={`${teacherPanel()} p-10 text-center`}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-gold-muted)]">
            <Rocket className="h-8 w-8 text-[var(--brand-gold)]" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">{t("teacherDashboard.nav.nextJumpBonus")}</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            {t("teacherDashboard.nextJumpRebuild", {
              defaultValue: "Dieses Modul wird neu aufgebaut. Die neue Struktur folgt in Kürze.",
            })}
          </p>
          {bonusLevel != null && (
            <p className="mt-6 text-sm font-medium text-foreground">
              {t("teacherDashboard.nextJumpLevel", { level: bonusLevel, defaultValue: "NextJump Level {{level}}" })}
            </p>
          )}
        </div>
      </div>
    </TeacherDashboardLayout>
  );
}
