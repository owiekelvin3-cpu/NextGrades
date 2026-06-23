"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useCms } from "@/context/CmsContext";
import { useToast } from "@/context/ToastContext";
import { fetchCmsFields, publishCmsFields, seedCmsContent } from "@/lib/cms/cms-api";
import type { MergedCmsField, EditLocale } from "@/lib/cms/merge-content";
import { buildSavePayloads, getDirtyFields } from "@/lib/cms/save-content";

type PublishMode = "draft" | "publish";

type CmsEditorContextValue = {
  fields: MergedCmsField[];
  loading: boolean;
  needsSetup: boolean;
  editLocale: EditLocale;
  setEditLocale: (l: EditLocale) => void;
  previewTick: number;
  bumpPreview: () => void;
  selectedKey: string | null;
  setSelectedKey: (key: string | null) => void;
  updateDraft: (i18nKey: string, locale: EditLocale, value: string) => void;
  resetField: (i18nKey: string) => void;
  getField: (i18nKey: string) => MergedCmsField | undefined;
  dirtyCount: number;
  pageDirtyCount: (pageId: string) => number;
  sectionDirtyCount: (fieldKeys: string[]) => number;
  saveDraft: (pageId?: string) => Promise<void>;
  publish: (pageId?: string) => Promise<void>;
  publishSection: (fieldKeys: string[]) => Promise<void>;
  saveSectionDraft: (fieldKeys: string[]) => Promise<void>;
  reload: () => Promise<void>;
  runSetup: () => Promise<void>;
  publishing: boolean;
};

const CmsEditorContext = createContext<CmsEditorContextValue | null>(null);

export function CmsEditorProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const { refresh: refreshCms } = useCms();
  const [fields, setFields] = useState<MergedCmsField[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [editLocale, setEditLocale] = useState<EditLocale>("en");
  const [previewTick, setPreviewTick] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const { content, seeded } = await fetchCmsFields();
      setFields(content);
      setNeedsSetup(!seeded);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load CMS");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const runSetup = useCallback(async () => {
    setLoading(true);
    try {
      await seedCmsContent();
      setNeedsSetup(false);
      toast.success("Website content initialized");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Setup failed");
    } finally {
      setLoading(false);
    }
  }, [load, toast]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once
  }, []);

  const dirtyFields = useMemo(() => getDirtyFields(fields), [fields]);

  const updateDraft = useCallback((i18nKey: string, locale: EditLocale, value: string) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.i18n_key !== i18nKey) return f;
        if (f.field_type === "image") {
          return { ...f, draft: { en: value, de: value } };
        }
        return { ...f, draft: { ...f.draft, [locale]: value } };
      })
    );
    setPreviewTick((n) => n + 1);
  }, []);

  const resetField = useCallback((i18nKey: string) => {
    setFields((prev) =>
      prev.map((f) => (f.i18n_key === i18nKey ? { ...f, draft: { ...f.published } } : f))
    );
  }, []);

  const applyPublishResult = useCallback((published: MergedCmsField[]) => {
    const keys = new Set(published.map((f) => f.i18n_key));
    setFields((prev) =>
      prev.map((f) => {
        if (!keys.has(f.i18n_key)) return f;
        return {
          ...f,
          published: { ...f.draft },
          draft: { ...f.draft },
          isPersisted: true,
          isCustomized: true,
          hasUnpublishedChanges: false,
        };
      })
    );
  }, []);

  const persist = useCallback(
    async (mode: PublishMode, options?: { pageId?: string; fieldKeys?: string[] }) => {
      let dirty = [...dirtyFields];
      if (options?.pageId) dirty = dirty.filter((f) => f.pageGroup === options.pageId);
      if (options?.fieldKeys?.length) {
        const keys = new Set(options.fieldKeys);
        dirty = dirty.filter((f) => keys.has(f.i18n_key));
      }
      if (!dirty.length) {
        toast.error(mode === "draft" ? "No changes to save" : "Change something first, then save");
        return;
      }
      setPublishing(true);
      try {
        const updates = buildSavePayloads(dirty, mode);
        const data = await publishCmsFields(updates, mode);
        applyPublishResult(dirty);
        if (mode === "publish") {
          await refreshCms();
          toast.success("Changes saved! Live site updated.");
        } else {
          toast.success(`Saved ${data.count} draft(s)`);
        }
        setPreviewTick((n) => n + 1);
        await load();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      } finally {
        setPublishing(false);
      }
    },
    [applyPublishResult, dirtyFields, load, refreshCms, toast]
  );

  const sectionDirtyCount = useCallback(
    (fieldKeys: string[]) => {
      const keys = new Set(fieldKeys);
      return dirtyFields.filter((f) => keys.has(f.i18n_key)).length;
    },
    [dirtyFields]
  );

  const value: CmsEditorContextValue = {
    fields,
    loading,
    needsSetup,
    editLocale,
    setEditLocale,
    previewTick,
    bumpPreview: () => setPreviewTick((n) => n + 1),
    selectedKey,
    setSelectedKey,
    updateDraft,
    resetField,
    getField: (key) => fields.find((f) => f.i18n_key === key),
    dirtyCount: dirtyFields.length,
    pageDirtyCount: (pageId) => dirtyFields.filter((f) => f.pageGroup === pageId).length,
    sectionDirtyCount,
    saveDraft: (pageId) => persist("draft", { pageId }),
    publish: (pageId) => persist("publish", { pageId }),
    publishSection: (fieldKeys) => persist("publish", { fieldKeys }),
    saveSectionDraft: (fieldKeys) => persist("draft", { fieldKeys }),
    reload: load,
    runSetup,
    publishing,
  };

  return <CmsEditorContext.Provider value={value}>{children}</CmsEditorContext.Provider>;
}

export function useCmsEditor() {
  const ctx = useContext(CmsEditorContext);
  if (!ctx) throw new Error("useCmsEditor must be used within CmsEditorProvider");
  return ctx;
}
