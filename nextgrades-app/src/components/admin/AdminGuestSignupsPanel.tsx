"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { useTranslation } from "react-i18next";
import {
  AdminTable,
  AdminTableActionsMenu,
  AdminTableStatusBadge,
} from "@/components/admin/AdminTable";
import { formatPlanLabel, SUBSCRIPTION_PLAN_LABELS, parsePlanId } from "@/lib/subscriptions/types";
import { cn } from "@/lib/utils";
import { themeSelectCompactClass } from "@/lib/theme/form-fields";
import { CheckCircle2, Loader2, Mail, Plus, RefreshCw } from "lucide-react";

type GuestRequest = {
  id: string;
  stripe_session_id: string;
  status: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  payment_email: string | null;
  phone: string | null;
  plan_id: string | null;
  billing: string | null;
  subject_name: string | null;
  grade: string | null;
  semester: string | null;
  amount_paid: number | null;
  currency: string | null;
  subscription_starts_at: string | null;
  subscription_ends_at: string | null;
  created_at: string;
  fulfilled_at: string | null;
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "default" | "outline"> = {
  fulfilled: "success",
  details_submitted: "warning",
  payment_received: "outline",
  cancelled: "default",
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("de-AT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function formatMoney(amount: number | null, currency?: string | null) {
  if (amount == null) return "-";
  return new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency: currency || "EUR",
  }).format(amount);
}

export function AdminGuestSignupsPanel() {
  const { t } = useTranslation();
  const { success, error: toastError } = useToast();
  const [requests, setRequests] = useState<GuestRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("details_submitted");
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<GuestRequest | null>(null);
  const [fulfillRole, setFulfillRole] = useState<"student" | "teacher">("student");

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: "100", status: statusFilter });
      const res = await fetch(`/api/admin/guest-account-requests?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setRequests(data.requests || []);
    } catch (err) {
      toastError(err instanceof Error ? err.message : t("adminGuestSignups.fetchFailed"));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toastError, t]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const statusLabel = useCallback(
    (status: string) => t(`adminGuestSignups.status.${status}`, { defaultValue: status }),
    [t]
  );

  const handleFulfill = async (request: GuestRequest) => {
    setFulfillingId(request.id);
    try {
      const res = await fetch(`/api/admin/guest-account-requests/${request.id}/fulfill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: fulfillRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("adminGuestSignups.fulfillFailed"));
      success(t("adminGuestSignups.fulfillSuccess", { email: data.user?.email || request.email }));
      setSelected(null);
      void fetchRequests();
    } catch (err) {
      toastError(err instanceof Error ? err.message : t("adminGuestSignups.fulfillFailed"));
    } finally {
      setFulfillingId(null);
    }
  };

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === "details_submitted" || r.status === "payment_received").length,
    [requests]
  );

  const selectClass = (value: string) => themeSelectCompactClass(value, "w-full max-w-xs rounded-lg py-2");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-text-muted">{t("adminGuestSignups.description")}</p>
          {pendingCount > 0 && (
            <p className="mt-1 text-sm font-medium text-[var(--brand-gold)]">
              {t("adminGuestSignups.pendingCount", { count: pendingCount })}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={selectClass(statusFilter)}
            aria-label={t("adminGuestSignups.filterStatus")}
          >
            <option value="all">{t("adminGuestSignups.filterAll")}</option>
            <option value="details_submitted">{statusLabel("details_submitted")}</option>
            <option value="payment_received">{statusLabel("payment_received")}</option>
            <option value="fulfilled">{statusLabel("fulfilled")}</option>
          </select>
          <Button variant="outline" size="md" onClick={() => void fetchRequests()} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      <AdminTable<GuestRequest>
        loading={loading}
        data={requests}
        getRowId={(row) => row.id}
        wrapInCard
        emptyState={{ title: t("adminGuestSignups.empty") }}
        columns={[
          {
            id: "customer",
            header: t("adminGuestSignups.colCustomer"),
            cell: (row) => {
              const name = [row.first_name, row.last_name].filter(Boolean).join(" ") || "-";
              const email = row.email || row.payment_email || "-";
              return (
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{name}</p>
                  <p className="truncate text-xs text-text-muted">{email}</p>
                </div>
              );
            },
          },
          {
            id: "plan",
            header: t("adminGuestSignups.colPlan"),
            cell: (row) => {
              const planKey = parsePlanId(row.plan_id);
              return (
                <div>
                  <p className="text-sm font-medium">{SUBSCRIPTION_PLAN_LABELS[planKey]}</p>
                  <p className="text-xs text-text-muted">
                    {row.billing === "yearly"
                      ? t("adminGuestSignups.billingYearly")
                      : row.billing === "semester"
                        ? t("adminGuestSignups.billingSemester", { defaultValue: "Semester" })
                        : t("adminGuestSignups.billingMonthly")}
                  </p>
                </div>
              );
            },
          },
          {
            id: "subject",
            header: t("adminGuestSignups.colSubject"),
            cell: (row) => (
              <p className="text-sm text-text-muted">
                {[row.subject_name, row.grade ? `Klasse ${row.grade}` : null, row.semester ? `S${row.semester}` : null]
                  .filter(Boolean)
                  .join(" · ") || "-"}
              </p>
            ),
          },
          {
            id: "amount",
            header: t("adminGuestSignups.colAmount"),
            align: "right",
            cell: (row) => (
              <span className="text-sm font-medium">{formatMoney(row.amount_paid, row.currency)}</span>
            ),
          },
          {
            id: "duration",
            header: t("adminGuestSignups.colDuration"),
            cell: (row) => (
              <div className="text-xs text-text-muted">
                <p>{formatDate(row.subscription_starts_at)} →</p>
                <p>{formatDate(row.subscription_ends_at)}</p>
              </div>
            ),
          },
          {
            id: "status",
            header: t("adminGuestSignups.colStatus"),
            cell: (row) => (
              <AdminTableStatusBadge
                variant={STATUS_VARIANT[row.status] ?? "default"}
                label={statusLabel(row.status)}
              />
            ),
          },
          {
            id: "actions",
            header: "",
            align: "right",
            width: "3rem",
            cell: (row) => (
              <AdminTableActionsMenu
                actions={[
                  {
                    id: "review",
                    label: t("adminGuestSignups.review"),
                    onClick: () => {
                      setSelected(row);
                      setFulfillRole("student");
                    },
                  },
                ]}
              />
            ),
          },
        ]}
      />

      {selected && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            aria-label={t("adminUsers.createClose")}
            onClick={() => !fulfillingId && setSelected(null)}
          />
          <div className="theme-modal-panel fixed inset-x-4 top-1/2 z-[110] max-h-[90dvh] -translate-y-1/2 overflow-y-auto rounded-2xl border p-6 shadow-2xl sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2">
            <h3 className="mb-1 text-lg font-bold text-foreground">{t("adminGuestSignups.modalTitle")}</h3>
            <p className="mb-5 text-sm text-text-muted">{t("adminGuestSignups.modalDesc")}</p>

            <dl className="mb-5 space-y-2 rounded-xl border border-border-default bg-[var(--surface-subtle)] p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">{t("adminGuestSignups.colPlan")}</dt>
                <dd className="font-medium text-foreground">{formatPlanLabel(selected.plan_id, selected.billing)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">{t("adminGuestSignups.colAmount")}</dt>
                <dd className="font-medium">{formatMoney(selected.amount_paid, selected.currency)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">{t("adminGuestSignups.colDuration")}</dt>
                <dd className="text-right text-xs">
                  {formatDate(selected.subscription_starts_at)} – {formatDate(selected.subscription_ends_at)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">{t("adminGuestSignups.colCustomer")}</dt>
                <dd className="text-right">
                  {[selected.first_name, selected.last_name].filter(Boolean).join(" ") || "-"}
                  <br />
                  <span className="text-xs text-text-muted">{selected.email || selected.payment_email}</span>
                </dd>
              </div>
            </dl>

            <div className="mb-5">
              <label className="mb-1.5 block text-sm font-medium text-foreground-secondary">
                {t("adminUsers.createRole")}
              </label>
              <select
                value={fulfillRole}
                onChange={(e) => setFulfillRole(e.target.value as "student" | "teacher")}
                className={themeSelectCompactClass(fulfillRole, "w-full rounded-lg py-2.5")}
                disabled={selected.status === "fulfilled"}
              >
                <option value="student">{t("adminUsers.roleStudent")}</option>
                <option value="teacher">{t("adminUsers.roleTeacher")}</option>
              </select>
              <p className="mt-2 text-xs text-text-muted">{t("adminGuestSignups.roleHint")}</p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setSelected(null)} disabled={!!fulfillingId}>
                {t("adminUsers.createCancel")}
              </Button>
              {selected.status !== "fulfilled" && (
                <Button
                  variant="gold"
                  onClick={() => void handleFulfill(selected)}
                  disabled={!!fulfillingId}
                >
                  {fulfillingId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      {t("adminGuestSignups.createAccount")}
                    </>
                  )}
                </Button>
              )}
              {selected.status === "fulfilled" && (
                <span className="inline-flex items-center gap-2 text-sm text-[#22C55E]">
                  <CheckCircle2 className="h-4 w-4" />
                  {t("adminGuestSignups.alreadyFulfilled")}
                </span>
              )}
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs text-text-muted">
              <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {t("adminGuestSignups.inviteNote")}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
