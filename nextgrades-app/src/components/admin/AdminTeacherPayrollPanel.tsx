"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@/lib/i18n/locales";
import { Loader2, RefreshCw, ChevronDown, ChevronUp, CreditCard, ListChecks, Clock, Euro } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import {
  AdminTable,
  AdminTableStatusBadge,
} from "@/components/admin/AdminTable";
import { AdminKpiCard, AdminKpiStrip } from "@/components/admin/AdminKpiCard";
import { themeInputClass } from "@/lib/theme/form-fields";
import { cn } from "@/lib/utils";

type TeacherLessonRow = {
  id: string;
  studentName: string;
  startTime: string;
  durationMinutes: number;
  status: string;
  attendance: string | null;
  title: string | null;
};

type TeacherPayrollRow = {
  teacherId: string;
  name: string;
  email: string | null;
  hourlyRate: number;
  completedLessons: number;
  totalHours: number;
  studentsTaught: { id: string; name: string }[];
  earningsMonth: number;
  amountToPay: number;
  lessons: TeacherLessonRow[];
};

type PayrollResponse = {
  month: string;
  monthLabel: string;
  teachers: TeacherPayrollRow[];
  totals: { lessons: number; hours: number; earnings: number; toPay: number };
};

function formatEuro(value: number): string {
  return new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(value);
}

function currentMonthValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function AdminTeacherPayrollPanel() {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const locale = getDateLocale(i18n.language);
  const [month, setMonth] = useState(currentMonthValue);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PayrollResponse | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingRateId, setSavingRateId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [rateDrafts, setRateDrafts] = useState<Record<string, string>>({});

  const fetchPayroll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/teacher-payroll?month=${encodeURIComponent(month)}`);
      const json = (await res.json()) as PayrollResponse & { error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to load payroll");
      setData(json);
      setRateDrafts(
        Object.fromEntries((json.teachers ?? []).map((row) => [row.teacherId, String(row.hourlyRate)]))
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("adminTeacherPayroll.loadError", { defaultValue: "Laden fehlgeschlagen." }));
    } finally {
      setLoading(false);
    }
  }, [month, t, toast]);

  useEffect(() => {
    void fetchPayroll();
  }, [fetchPayroll]);

  const monthLabel = data?.monthLabel ?? month;

  const saveRate = async (teacherId: string) => {
    const value = Number(rateDrafts[teacherId]);
    if (!Number.isFinite(value) || value < 0) {
      toast.error(t("adminTeacherPayroll.invalidRate", { defaultValue: "Ungültiger Stundensatz." }));
      return;
    }
    setSavingRateId(teacherId);
    try {
      const res = await fetch(`/api/admin/teacher-payroll/${teacherId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hourlyRate: value }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      toast.success(t("adminTeacherPayroll.rateSaved", { defaultValue: "Stundensatz gespeichert." }));
      await fetchPayroll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("adminTeacherPayroll.updateFailed", { defaultValue: "Speichern fehlgeschlagen." }));
    } finally {
      setSavingRateId(null);
    }
  };

  const markPaid = async (teacherId: string, amount: number) => {
    if (
      !confirm(
        t("adminTeacherPayroll.confirmPay", {
          defaultValue: "{{amount}} für diesen Monat als ausgezahlt markieren?",
          amount: formatEuro(amount),
        })
      )
    ) {
      return;
    }
    setPayingId(teacherId);
    try {
      const res = await fetch(`/api/admin/teacher-payroll/${teacherId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markPaid", month }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Payout failed");
      toast.success(t("adminTeacherPayroll.paidSuccess", { defaultValue: "Auszahlung erfasst." }));
      await fetchPayroll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("adminTeacherPayroll.payFailed", { defaultValue: "Auszahlung fehlgeschlagen." }));
    } finally {
      setPayingId(null);
    }
  };

  const expandedTeacher = useMemo(
    () => data?.teachers.find((row) => row.teacherId === expandedId) ?? null,
    [data, expandedId]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            {t("adminTeacherPayroll.month", { defaultValue: "Abrechnungsmonat" })}
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className={cn(themeInputClass, "w-auto")}
          />
          <p className="mt-1 text-xs text-text-muted">{monthLabel}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void fetchPayroll()} disabled={loading} className="gap-2">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          {t("adminTeacherPayroll.refresh", { defaultValue: "Aktualisieren" })}
        </Button>
      </div>

      {data ? (
        <AdminKpiStrip>
          <AdminKpiCard
            label={t("adminTeacherPayroll.kpiLessons", { defaultValue: "Abgeschlossene Stunden" })}
            value={String(data.totals.lessons)}
            icon={ListChecks}
          />
          <AdminKpiCard
            label={t("adminTeacherPayroll.kpiHours", { defaultValue: "Unterrichtsstunden" })}
            value={String(data.totals.hours)}
            icon={Clock}
            iconTone="info"
          />
          <AdminKpiCard
            label={t("adminTeacherPayroll.kpiEarnings", { defaultValue: "Einnahmen (Monat)" })}
            value={formatEuro(data.totals.earnings)}
            icon={Euro}
            iconTone="success"
          />
          <AdminKpiCard
            label={t("adminTeacherPayroll.kpiToPay", { defaultValue: "Auszuzahlen" })}
            value={formatEuro(data.totals.toPay)}
            icon={CreditCard}
            iconTone="warning"
          />
        </AdminKpiStrip>
      ) : null}

      <AdminTable<TeacherPayrollRow>
        title={t("adminTeacherPayroll.listTitle", { defaultValue: "Lehrkräfte — Monatsübersicht" })}
        loading={loading}
        data={data?.teachers ?? []}
        getRowId={(row) => row.teacherId}
        emptyState={{
          title: t("adminTeacherPayroll.empty", { defaultValue: "Keine abgeschlossenen Stunden in diesem Monat." }),
        }}
        columns={[
          {
            id: "teacher",
            header: t("adminTeacherPayroll.colTeacher", { defaultValue: "Lehrkraft" }),
            cell: (row) => (
              <div>
                <p className="font-medium text-foreground">{row.name}</p>
                {row.email ? <p className="text-xs text-text-muted">{row.email}</p> : null}
              </div>
            ),
          },
          {
            id: "lessons",
            header: t("adminTeacherPayroll.colLessons", { defaultValue: "Stunden" }),
            sortable: true,
            sortValue: (row) => row.completedLessons,
            cell: (row) => <span className="tabular-nums">{row.completedLessons}</span>,
          },
          {
            id: "hours",
            header: t("adminTeacherPayroll.colHours", { defaultValue: "Stunden (h)" }),
            sortable: true,
            sortValue: (row) => row.totalHours,
            cell: (row) => <span className="tabular-nums">{row.totalHours}</span>,
          },
          {
            id: "students",
            header: t("adminTeacherPayroll.colStudents", { defaultValue: "SchülerInnen" }),
            cell: (row) => (
              <span className="text-sm text-text-muted">
                {row.studentsTaught.length
                  ? row.studentsTaught.map((s) => s.name).join(", ")
                  : "—"}
              </span>
            ),
          },
          {
            id: "rate",
            header: t("adminTeacherPayroll.colRate", { defaultValue: "Stundensatz" }),
            cell: (row) => (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={rateDrafts[row.teacherId] ?? String(row.hourlyRate)}
                  onChange={(e) =>
                    setRateDrafts((prev) => ({ ...prev, [row.teacherId]: e.target.value }))
                  }
                  className={cn(themeInputClass, "w-24 py-1.5 text-sm")}
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={savingRateId === row.teacherId}
                  onClick={() => void saveRate(row.teacherId)}
                >
                  {savingRateId === row.teacherId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("adminTeacherPayroll.saveRate", { defaultValue: "Speichern" })
                  )}
                </Button>
              </div>
            ),
          },
          {
            id: "earnings",
            header: t("adminTeacherPayroll.colEarnings", { defaultValue: "Einnahmen" }),
            sortable: true,
            sortValue: (row) => row.earningsMonth,
            cell: (row) => <span className="font-semibold tabular-nums">{formatEuro(row.earningsMonth)}</span>,
          },
          {
            id: "topay",
            header: t("adminTeacherPayroll.colToPay", { defaultValue: "Auszuzahlen" }),
            sortable: true,
            sortValue: (row) => row.amountToPay,
            cell: (row) => (
              <AdminTableStatusBadge
                variant={row.amountToPay > 0 ? "warning" : "success"}
                label={formatEuro(row.amountToPay)}
              />
            ),
          },
          {
            id: "actions",
            header: "",
            align: "right",
            cell: (row) => (
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedId((id) => (id === row.teacherId ? null : row.teacherId))}
                  className="gap-1"
                >
                  {expandedId === row.teacherId ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  {t("adminTeacherPayroll.details", { defaultValue: "Details" })}
                </Button>
                {row.amountToPay > 0 ? (
                  <Button
                    variant="gold"
                    size="sm"
                    disabled={payingId === row.teacherId}
                    onClick={() => void markPaid(row.teacherId, row.amountToPay)}
                  >
                    {payingId === row.teacherId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t("adminTeacherPayroll.markPaid", { defaultValue: "Als bezahlt" })
                    )}
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]}
      />

      {expandedTeacher ? (
        <div className="rounded-2xl border border-border-default bg-surface-elevated p-5">
          <h3 className="mb-4 text-sm font-bold text-foreground">
            {t("adminTeacherPayroll.lessonHistory", {
              defaultValue: "Abgeschlossene Stunden — {{name}}",
              name: expandedTeacher.name,
            })}
          </h3>
          {expandedTeacher.lessons.length === 0 ? (
            <p className="text-sm text-text-muted">
              {t("adminTeacherPayroll.noLessons", { defaultValue: "Keine Stunden in diesem Monat." })}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-default text-left text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                    <th className="py-2 pr-3">{t("adminTeacherPayroll.colDate", { defaultValue: "Datum" })}</th>
                    <th className="py-2 pr-3">{t("adminTeacherPayroll.colStudent", { defaultValue: "SchülerIn" })}</th>
                    <th className="py-2 pr-3">{t("adminTeacherPayroll.colDuration", { defaultValue: "Dauer" })}</th>
                    <th className="py-2 pr-3">{t("adminTeacherPayroll.colAttendance", { defaultValue: "Anwesenheit" })}</th>
                    <th className="py-2">{t("adminTeacherPayroll.colStatus", { defaultValue: "Status" })}</th>
                  </tr>
                </thead>
                <tbody>
                  {expandedTeacher.lessons.map((lesson) => (
                    <tr key={lesson.id} className="border-b border-border-default/60 last:border-0">
                      <td className="py-3 pr-3 text-text-muted">
                        {new Date(lesson.startTime).toLocaleString(locale, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 pr-3 font-medium text-foreground">{lesson.studentName}</td>
                      <td className="py-3 pr-3 tabular-nums">{lesson.durationMinutes} min</td>
                      <td className="py-3 pr-3 capitalize">{lesson.attendance ?? "—"}</td>
                      <td className="py-3">
                        <AdminTableStatusBadge
                          variant={lesson.status === "completed" ? "success" : "default"}
                          label={lesson.status}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
