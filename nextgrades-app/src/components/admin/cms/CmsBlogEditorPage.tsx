"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ADMIN_CMS_PREFIX } from "@/lib/admin/portal-paths";
import { getBlogPost } from "@/lib/cms/queries";
import { updateBlogPost } from "@/lib/cms/mutations";
import { slugify } from "@/lib/cms/utils";
import type { BlogStatus } from "@/lib/cms/spec-types";
import { useAutoSave } from "@/hooks/useAutoSave";
import { CmsRichTextEditor } from "@/components/admin/cms/CmsRichTextEditor";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/context/ToastContext";

type Props = { postId: string };

type Draft = {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image_url: string;
  tags: string[];
  status: BlogStatus;
  published_at: string;
};

const emptyDraft = (): Draft => ({
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  cover_image_url: "",
  tags: [],
  status: "draft",
  published_at: "",
});

export function CmsBlogEditorPage({ postId }: Props) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [tagInput, setTagInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const post = await getBlogPost(postId);
      setDraft({
        title: post.title,
        slug: post.slug,
        content: post.content ?? "",
        excerpt: post.excerpt ?? "",
        cover_image_url: post.cover_image_url ?? "",
        tags: post.tags ?? [],
        status: post.status,
        published_at: post.published_at ? post.published_at.slice(0, 16) : "",
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load post");
    } finally {
      setLoading(false);
    }
  }, [postId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const savePayload = useMemo(
    () => ({
      title: draft.title,
      slug: draft.slug || slugify(draft.title),
      content: draft.content,
      excerpt: draft.excerpt.slice(0, 200),
      cover_image_url: draft.cover_image_url || null,
      tags: draft.tags,
      status: draft.status,
      published_at: draft.published_at ? new Date(draft.published_at).toISOString() : null,
    }),
    [draft]
  );

  const saveFn = useCallback(
    async (val: typeof savePayload) => {
      await updateBlogPost(postId, val);
    },
    [postId]
  );

  const { status: autoStatus } = useAutoSave(savePayload, saveFn, 2000);

  const publish = async (nextStatus: BlogStatus) => {
    try {
      const payload = { ...savePayload, status: nextStatus };
      await updateBlogPost(postId, payload);
      setDraft((d) => ({ ...d, status: nextStatus }));
      toast.success(nextStatus === "published" ? "Post published" : "Draft saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().replace(/,$/, "");
    if (!tag || draft.tags.includes(tag)) return;
    setDraft((d) => ({ ...d, tags: [...d.tags, tag] }));
    setTagInput("");
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-gold)]" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface-muted">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default bg-surface-elevated px-4 py-3 md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link
            href={`${ADMIN_CMS_PREFIX}/blog`}
            className="flex items-center gap-1 text-sm text-text-muted hover:text-[var(--brand-gold)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Blog
          </Link>
          <Input
            value={draft.title}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                title: e.target.value,
                slug: d.slug || slugify(e.target.value),
              }))
            }
            className="max-w-xl border-0 bg-transparent text-xl font-bold shadow-none focus-visible:ring-0"
            placeholder="Post title"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">
            {autoStatus === "saving" && "Saving…"}
            {autoStatus === "saved" && "Saved"}
            {autoStatus === "error" && "Save failed"}
          </span>
          <Button variant="outline" onClick={() => void publish("draft")}>
            Save draft
          </Button>
          <Button variant="gold" onClick={() => void publish("published")}>
            Publish
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:flex-row md:p-6">
        <div className="min-w-0 flex-1">
          <Card className="p-4">
            <CmsRichTextEditor
              value={draft.content}
              onChange={(html) => setDraft((d) => ({ ...d, content: html }))}
              placeholder="Write your article…"
            />
          </Card>
        </div>

        <aside className="w-full shrink-0 space-y-4 md:w-80">
          <Card className="space-y-4 p-4">
            <div>
              <label className="text-xs font-semibold uppercase text-text-muted">Excerpt</label>
              <textarea
                value={draft.excerpt}
                maxLength={200}
                onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-border-default bg-surface-elevated px-3 py-2 text-sm"
                rows={3}
              />
              <p className="mt-1 text-right text-xs text-text-muted">{draft.excerpt.length}/200</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-text-muted">Cover image URL</label>
              <Input
                value={draft.cover_image_url}
                onChange={(e) => setDraft((d) => ({ ...d, cover_image_url: e.target.value }))}
                className="mt-1"
                placeholder="https://…"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-text-muted">Tags</label>
              <div className="mt-1 flex flex-wrap gap-1">
                {draft.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="rounded-full bg-surface-subtle px-2 py-0.5 text-xs"
                    onClick={() => setDraft((d) => ({ ...d, tags: d.tags.filter((t) => t !== tag) }))}
                  >
                    {tag} ×
                  </button>
                ))}
              </div>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="mt-2"
                placeholder="Add tag, press Enter"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-text-muted">Publish date</label>
              <Input
                type="datetime-local"
                value={draft.published_at}
                onChange={(e) => setDraft((d) => ({ ...d, published_at: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-text-muted">Slug</label>
              <Input
                value={draft.slug}
                onChange={(e) => setDraft((d) => ({ ...d, slug: slugify(e.target.value) }))}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
