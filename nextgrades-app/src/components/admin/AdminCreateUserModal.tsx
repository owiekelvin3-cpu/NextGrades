"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Mail, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";

type AdminCreateUserModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function AdminCreateUserModal({ open, onClose, onSuccess }: AdminCreateUserModalProps) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setFullName("");
    setRole("student");
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, submitting, onClose]);

  useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          fullName: fullName.trim() || undefined,
          role,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("adminUsers.createFailed"));
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("adminUsers.createFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || !open) return null;

  const inputClass =
    "theme-input w-full rounded-lg px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[var(--input-focus-ring)]";

  const labelClass = "mb-1.5 block text-sm font-medium text-foreground-secondary";

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        aria-label={t("adminUsers.createClose")}
        onClick={() => !submitting && onClose()}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-create-user-title"
        tabIndex={-1}
        className="theme-modal-panel fixed inset-x-4 top-1/2 z-[110] max-h-[90dvh] -translate-y-1/2 overflow-y-auto rounded-2xl border shadow-2xl sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2"
      >
        <div className="flex items-center justify-between border-b border-border-default px-5 py-4">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-[var(--brand-gold)]" aria-hidden />
            <h2 id="admin-create-user-title" className="text-lg font-bold text-foreground">
              {t("adminUsers.createTitle")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex min-h-10 min-w-10 items-center justify-center rounded-lg text-text-muted hover:bg-[var(--table-row-hover)]"
            aria-label={t("adminUsers.createClose")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <p className="text-sm text-text-muted">
            {t("adminUsers.createDescription")}
          </p>

          <div>
            <label htmlFor="create-user-email" className={labelClass}>
              {t("adminUsers.createEmail")}
            </label>
            <input
              id="create-user-email"
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label htmlFor="create-user-name" className={labelClass}>
              {t("adminUsers.createFullName")}{" "}
              <span className="font-normal text-gray-500">({t("adminUsers.optional")})</span>
            </label>
            <input
              id="create-user-name"
              type="text"
              autoComplete="off"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="create-user-role" className={labelClass}>
              {t("adminUsers.createRole")}
            </label>
            <select
              id="create-user-role"
              value={role}
              onChange={(e) => setRole(e.target.value as "student" | "teacher")}
              className={inputClass}
            >
              <option value="student">{t("adminUsers.roleStudent")}</option>
              <option value="teacher">{t("adminUsers.roleTeacher")}</option>
            </select>
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" size="md" onClick={onClose} disabled={submitting}>
              {t("adminUsers.createCancel")}
            </Button>
            <Button type="submit" variant="gold" size="md" disabled={submitting}>
              <Mail className="mr-2 h-4 w-4" />
              {submitting ? t("adminUsers.createSending") : t("adminUsers.createSend")}
            </Button>
          </div>
        </form>
      </div>
    </>,
    document.body
  );
}
