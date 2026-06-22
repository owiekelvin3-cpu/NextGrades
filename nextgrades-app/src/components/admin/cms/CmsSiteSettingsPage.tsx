"use client";

import { useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { getSiteSettings } from "@/lib/cms/queries";
import { upsertSiteSettings } from "@/lib/cms/mutations";
import type { SiteSettings } from "@/lib/cms/spec-types";
import { CMSSectionHeader } from "@/components/cms/CMSSectionHeader";
import { CMSLoadingState } from "@/components/cms/CMSLoadingState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

const defaults: Omit<SiteSettings, "id" | "updated_at"> = {
  site_name: "NextGrades",
  logo_url: null,
  favicon_url: null,
  contact_email: null,
  contact_phone: null,
  contact_address: null,
  social_instagram: null,
  social_facebook: null,
  social_linkedin: null,
  social_whatsapp: null,
  seo_title: null,
  seo_description: null,
  seo_og_image: null,
};

type Tab = "general" | "contact" | "seo";

export function CmsSiteSettingsPage() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaults);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSiteSettings();
      if (data) setForm({ ...defaults, ...data });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const set = (key: keyof typeof defaults, value: string) => {
    setForm((f) => ({ ...f, [key]: value || null }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await upsertSiteSettings(form);
      toast.success("Site settings saved successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "general", label: "General" },
    { id: "contact", label: "Contact & social" },
    { id: "seo", label: "SEO defaults" },
  ];

  return (
    <div className="flex h-full flex-col overflow-auto bg-surface-muted p-4 md:p-6">
      <CMSSectionHeader
        title="Site settings"
        description="Global branding, contact details, and default SEO metadata."
        trail={["Admin", "CMS", "Site settings"]}
      />

      {loading ? (
        <CMSLoadingState variant="cards" rows={3} />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2 border-b border-border-default pb-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  tab === t.id
                    ? "bg-[var(--brand-gold)] text-[var(--brand-navy)]"
                    : "text-text-muted hover:bg-surface-subtle hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Card className="max-w-2xl space-y-4 p-6">
            {tab === "general" && (
              <>
                <Field label="Site name" value={form.site_name} onChange={(v) => set("site_name", v)} />
                <Field label="Logo URL" value={form.logo_url ?? ""} onChange={(v) => set("logo_url", v)} />
                <Field label="Favicon URL" value={form.favicon_url ?? ""} onChange={(v) => set("favicon_url", v)} />
              </>
            )}
            {tab === "contact" && (
              <>
                <Field label="Contact email" value={form.contact_email ?? ""} onChange={(v) => set("contact_email", v)} />
                <Field label="Phone" value={form.contact_phone ?? ""} onChange={(v) => set("contact_phone", v)} />
                <Field label="Address" value={form.contact_address ?? ""} onChange={(v) => set("contact_address", v)} textarea />
                <Field label="Instagram" value={form.social_instagram ?? ""} onChange={(v) => set("social_instagram", v)} />
                <Field label="Facebook" value={form.social_facebook ?? ""} onChange={(v) => set("social_facebook", v)} />
                <Field label="LinkedIn" value={form.social_linkedin ?? ""} onChange={(v) => set("social_linkedin", v)} />
                <Field label="WhatsApp" value={form.social_whatsapp ?? ""} onChange={(v) => set("social_whatsapp", v)} />
              </>
            )}
            {tab === "seo" && (
              <>
                <Field label="Default meta title" value={form.seo_title ?? ""} onChange={(v) => set("seo_title", v)} />
                <div>
                  <Field
                    label="Default meta description"
                    value={form.seo_description ?? ""}
                    onChange={(v) => set("seo_description", v.slice(0, 160))}
                    textarea
                  />
                  <p className="mt-1 text-right text-xs text-text-muted">
                    {(form.seo_description ?? "").length}/160
                  </p>
                </div>
                <Field label="Default OG image URL" value={form.seo_og_image ?? ""} onChange={(v) => set("seo_og_image", v)} />
              </>
            )}

            <Button variant="gold" onClick={() => void save()} disabled={saving} className="mt-4">
              <Save className="mr-2 h-4 w-4" />
              Save all settings
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-xl border border-border-default bg-surface-elevated px-3 py-2 text-sm"
        />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1" />
      )}
    </div>
  );
}
