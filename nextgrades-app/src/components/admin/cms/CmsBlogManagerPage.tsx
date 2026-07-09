"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ADMIN_CMS_PREFIX } from "@/lib/admin/portal-paths";
import { getBlogPosts } from "@/lib/cms/queries";
import { createBlogPost, deleteBlogPost } from "@/lib/cms/mutations";
import { slugify } from "@/lib/cms/utils";
import type { BlogPost } from "@/lib/cms/spec-types";
import { useCMSSection } from "@/hooks/useCMSSection";
import { CMSSectionHeader } from "@/components/cms/CMSSectionHeader";
import { CMSEmptyState } from "@/components/cms/CMSEmptyState";
import { CMSLoadingState } from "@/components/cms/CMSLoadingState";
import { DeleteConfirmDialog } from "@/components/cms/DeleteConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";
import { FileText } from "lucide-react";

export function CmsBlogManagerPage() {
  const toast = useToast();
  const { data, loading, error, refetch } = useCMSSection<BlogPost>(getBlogPosts);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);

  const handleCreate = useCallback(async () => {
    setCreating(true);
    try {
      const title = "Untitled post";
      const post = await createBlogPost({ title, slug: `${slugify(title)}-${Date.now()}` });
      toast.success("Draft post created");
      window.location.href = `${ADMIN_CMS_PREFIX}/blog/${post.id}`;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create post");
    } finally {
      setCreating(false);
    }
  }, [toast]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBlogPost(deleteTarget.id);
      toast.success("Post deleted");
      setDeleteTarget(null);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div className="flex h-full flex-col overflow-auto bg-surface-muted p-4 md:p-6">
      <CMSSectionHeader
        title="Blog"
        description="Create and publish articles for your public blog."
        trail={["Admin", "CMS", "Blog"]}
        action={
          <Button variant="gold" onClick={() => void handleCreate()} disabled={creating}>
            <Plus className="mr-2 h-4 w-4" />
            New post
          </Button>
        }
      />

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span>Failed to load blog: {error}</span>
          <Button variant="ghost" size="sm" onClick={refetch}>
            Retry
          </Button>
        </div>
      )}

      {loading && <CMSLoadingState />}

      {!loading && !error && data.length === 0 && (
        <CMSEmptyState
          icon={FileText}
          title="No blog posts yet"
          description="Write your first article to share updates, tips, and news with visitors."
          actionLabel="Create your first post"
          onAction={() => void handleCreate()}
        />
      )}

      {!loading && data.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-border-default bg-surface-elevated">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border-default bg-surface-subtle text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3">Cover</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((post) => (
                <tr
                  key={post.id}
                  className={post.status === "draft" ? "border-t border-border-default opacity-75" : "border-t border-border-default"}
                >
                  <td className="px-4 py-3">
                    {post.cover_image_url ? (
                      <Image
                        src={post.cover_image_url}
                        alt=""
                        width={48}
                        height={32}
                        className="h-8 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-12 items-center justify-center rounded bg-surface-subtle text-text-muted">
                        <FileText className="h-4 w-4" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{post.title}</td>
                  <td className="px-4 py-3 text-text-muted">{(post.tags ?? []).join(", ") || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={post.status === "published" ? "success" : "default"}>
                      {post.status === "published" ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {post.published_at ? new Date(post.published_at).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" href={`${ADMIN_CMS_PREFIX}/blog/${post.id}`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(post)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        title={deleteTarget ? `Delete "${deleteTarget.title}"?` : "Delete post?"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
