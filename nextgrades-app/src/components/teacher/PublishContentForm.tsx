"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { themeInputClass, themeSelectClass } from "@/lib/theme/form-fields";
import {
  CONTENT_TYPES,
  DIFFICULTY_LEVELS,
  AGE_RANGES,
  LANGUAGES,
  DEFAULT_THUMBNAIL,
} from "@/lib/resources/constants";
import {
  RESOURCE_FILE_ACCEPT,
  resourceFileValidationError,
  isAllowedThumbnailMime,
  resolveUploadMimeType,
} from "@/lib/storage/config";
import { compressImageFile } from "@/lib/resources/image-utils";
import { filterCatalogClasses } from "@/lib/catalog/classes";
import {
  removeClientUpload,
  uploadResourceFileFromBrowser,
  uploadThumbnailFromBrowser,
  parseApiError,
} from "@/lib/resources/client-upload";
import { RESOURCES_BUCKET, THUMBNAILS_BUCKET } from "@/lib/storage/config";
import { buildServerVerifyPath } from "@/lib/auth/verification-routes";
import { createBrowserClient } from "@/lib/supabase/client";
import type { UploadProgressSnapshot } from "@/lib/upload/xhr-upload";
import { PublishUploadProgress } from "@/components/teacher/PublishUploadProgress";
import {
  Upload,
  X,
  Check,
  ArrowRight,
  Image as ImageIcon,
  FileText,
  Video,
  File,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface Tag {
  id: string;
  name: string;
  color?: string;
}

type PublishContentFormProps = {
  resourceId?: string;
  initialData?: Partial<FormState>;
  /** Where to navigate after a successful save */
  redirectPath?: string;
  /** Admin uploads publish immediately without moderation */
  isAdmin?: boolean;
};

type FormState = {
  title: string;
  short_description: string;
  full_description: string;
  content_type: string;
  category_id: string;
  subject_id: string;
  class_id: string;
  class_ids: string[];
  semester: string;
  tag_ids: string[];
  difficulty_level: string;
  age_range: string;
  estimated_minutes: string;
  language: string;
  status: string;
  access_type: string;
  price: string;
  external_url: string;
};

const defaultForm: FormState = {
  title: "",
  short_description: "",
  full_description: "",
  content_type: "learning_material",
  category_id: "",
  subject_id: "",
  class_id: "",
  class_ids: [],
  semester: "",
  tag_ids: [],
  difficulty_level: "beginner",
  age_range: "all_ages",
  estimated_minutes: "",
  language: "en",
  status: "published",
  access_type: "free",
  price: "",
  external_url: "",
};

export function PublishContentForm({
  resourceId,
  initialData,
  redirectPath = "/dashboard/teacher/content",
  isAdmin = false,
}: PublishContentFormProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { success, error: toastError } = useToast();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressSnapshot | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [catalogSubjects, setCatalogSubjects] = useState<Array<{ id: string; name: string }>>([]);
  const [catalogClasses, setCatalogClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [form, setForm] = useState<FormState>(() => {
    const merged = { ...defaultForm, ...initialData };
    const classIds =
      Array.isArray(merged.class_ids) && merged.class_ids.length > 0
        ? merged.class_ids
        : merged.class_id
          ? [merged.class_id]
          : [];
    return { ...merged, class_ids: classIds, class_id: classIds[0] ?? "" };
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void Promise.all([
      fetch("/api/teacher/categories").then((r) => r.json()),
      fetch("/api/teacher/tags").then((r) => r.json()),
      fetch("/api/catalog").then((r) => r.json()),
    ]).then(([cats, tgs, catalog]) => {
      if (Array.isArray(cats)) setCategories(cats);
      if (Array.isArray(tgs)) setTags(tgs);
      if (Array.isArray(catalog?.subjects)) setCatalogSubjects(catalog.subjects);
      if (Array.isArray(catalog?.classes)) setCatalogClasses(filterCatalogClasses(catalog.classes));
    }).catch(() => {
      toastError(t("teacherPublish.errLoadCatalog"));
    });
  }, [toastError, t]);

  const inputCls = themeInputClass;
  const selectCls = (value: string) => themeSelectClass(value, "rounded-lg py-3");

  const labelCls = `block text-sm font-medium mb-2 text-foreground`;

  const handleThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const compressed = await compressImageFile(f);
      setThumbnail(compressed);
      setThumbnailPreview(URL.createObjectURL(compressed));
    } catch {
      setThumbnail(f);
      setThumbnailPreview(URL.createObjectURL(f));
    }
  };

  const toggleTag = (id: string) => {
    setForm((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(id) ? prev.tag_ids.filter((t) => t !== id) : [...prev.tag_ids, id],
    }));
  };

  const toggleClass = (id: string) => {
    setForm((prev) => {
      const class_ids = prev.class_ids.includes(id)
        ? prev.class_ids.filter((c) => c !== id)
        : [...prev.class_ids, id];
      return { ...prev, class_ids, class_id: class_ids[0] ?? "" };
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const err = resourceFileValidationError(f);
    if (err) {
      toastError(err);
      e.target.value = "";
      return;
    }
    setFile(f);
  };

  const handlePublish = async () => {
    if (!form.title.trim()) {
      toastError(t("teacherPublish.errTitle"));
      return;
    }

    if (form.status === "published" && (!form.subject_id || form.class_ids.length === 0)) {
      toastError(t("teacherPublish.errSubjectGrade"));
      setStep(2);
      return;
    }

    if (!file && !form.external_url && !resourceId) {
      toastError(t("teacherPublish.errFileOrUrl"));
      setStep(1);
      return;
    }

    if (file) {
      const err = resourceFileValidationError(file);
      if (err) {
        toastError(err);
        return;
      }
    }

    if (thumbnail) {
      const thumbMime = resolveUploadMimeType(thumbnail);
      if (!isAllowedThumbnailMime(thumbMime)) {
        toastError(t("teacherPublish.errThumbnail"));
        return;
      }
    }

    setUploading(true);
    setUploadProgress({
      phase: "preparing",
      percent: 2,
      loadedBytes: 0,
      totalBytes: (file?.size ?? 0) + (thumbnail?.size ?? 0) + 48_000,
      bytesPerSecond: 0,
      etaSeconds: null,
    });

    try {
      const supabase = createBrowserClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toastError(t("teacherPublish.errSignIn"));
        return;
      }

      setUploadProgress((p) => (p ? { ...p, phase: "preparing", percent: 8 } : p));

      const validateRes = await fetch("/api/teacher/publish/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          title: form.title.trim(),
          content_type: form.content_type,
          status: form.status,
          subject_id: form.subject_id || null,
          class_id: form.class_ids[0] || null,
          class_ids: form.class_ids,
          external_url: form.external_url || "",
          resource_id: resourceId || null,
          file_size: file?.size ?? null,
          has_new_file: Boolean(file),
          has_new_thumbnail: Boolean(thumbnail),
        }),
      });

      if (!validateRes.ok) {
        const message = await parseApiError(validateRes);
        if (
          validateRes.status === 403 &&
          (message.includes("Login verification") || message.includes("Email verification"))
        ) {
          toastError(message);
          router.push(
            buildServerVerifyPath(
              message.includes("Email verification") ? "signup" : "login",
              { redirect: redirectPath }
            )
          );
          return;
        }
        toastError(message);
        if (message.includes("Subject and grade")) setStep(2);
        return;
      }

      let storagePath: string | null = null;
      let fileName: string | null = null;
      let fileSize: number | null = null;
      let mimeType: string | null = null;
      let thumbPath: string | null = null;
      let thumbnailUrl: string | null = null;

      if (file) {
        setUploadProgress((p) => (p ? { ...p, phase: "uploading", percent: 15 } : p));
        const upload = await uploadResourceFileFromBrowser(supabase, user.id, file);
        if (upload.error || !upload.data) {
          toastError(upload.error || t("teacherPublish.errUpload"));
          return;
        }
        storagePath = upload.data.storagePath;
        fileName = upload.data.fileName;
        fileSize = upload.data.fileSize;
        mimeType = upload.data.mimeType;
        setUploadProgress((p) => (p ? { ...p, phase: "uploading", percent: 55 } : p));
      }

      if (thumbnail) {
        setUploadProgress((p) => (p ? { ...p, phase: "uploading", percent: 65 } : p));
        const thumb = await uploadThumbnailFromBrowser(supabase, user.id, thumbnail);
        if (thumb.error) {
          if (storagePath) await removeClientUpload(supabase, RESOURCES_BUCKET, storagePath);
          toastError(thumb.error);
          return;
        }
        thumbPath = thumb.storagePath;
        thumbnailUrl = thumb.publicUrl;
        setUploadProgress((p) => (p ? { ...p, phase: "uploading", percent: 80 } : p));
      }

      setUploadProgress((p) => (p ? { ...p, phase: "processing", percent: 90 } : p));

      const payload = {
        title: form.title.trim(),
        short_description: form.short_description.trim(),
        full_description: form.full_description.trim(),
        content_type: form.content_type,
        category_id: form.category_id || null,
        subject_id: form.subject_id || null,
        class_id: form.class_ids[0] || null,
        class_ids: form.class_ids,
        semester: form.semester || null,
        tag_ids: form.tag_ids,
        difficulty_level: form.difficulty_level,
        age_range: form.age_range,
        estimated_minutes: form.estimated_minutes || null,
        language: form.language,
        status: form.status,
        access_type: form.access_type,
        price: form.access_type === "premium" ? form.price || "0" : "0",
        external_url: form.external_url || "",
        resource_id: resourceId || null,
        storage_path: storagePath,
        file_name: fileName,
        file_size: fileSize,
        mime_type: mimeType,
        thumbnail_storage_path: thumbPath,
        thumbnail_url: thumbnailUrl,
      };

      const res = await fetch("/api/teacher/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      let result: { error?: string; moderation_status?: string; status?: string } = {};
      if (!res.ok) {
        const message = await parseApiError(res);
        if (storagePath) await removeClientUpload(supabase, RESOURCES_BUCKET, storagePath);
        if (thumbPath) await removeClientUpload(supabase, THUMBNAILS_BUCKET, thumbPath);
        if (
          res.status === 403 &&
          (message.includes("Login verification") || message.includes("Email verification"))
        ) {
          toastError(message);
          router.push(
            buildServerVerifyPath(
              message.includes("Email verification") ? "signup" : "login",
              { redirect: redirectPath }
            )
          );
          return;
        }
        toastError(message);
        if (message.includes("Subject and grade")) setStep(2);
        return;
      }

      try {
        result = await res.json();
      } catch {
        result = {};
      }

      setUploadProgress((p) => (p ? { ...p, phase: "complete", percent: 100 } : p));

      const actualStatus = result?.status ?? form.status;
      const actualModeration = result?.moderation_status;
      const isLive = actualStatus === "published" && actualModeration === "approved";
      const submittedForReview =
        form.status === "published" &&
        !isLive &&
        (actualModeration === "pending" || actualStatus === "draft");
      success(
        submittedForReview
          ? t("teacherPublish.successReview")
          : isLive
            ? t("teacherPublish.successPublished")
            : t("teacherPublish.successDraft")
      );
      router.push(redirectPath);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("teacherPublish.errUploadGeneric");
      toastError(message);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const getFileIcon = (f: File) => {
    if (f.type.startsWith("video")) return <Video className="w-10 h-10 text-[#D4AF37]" />;
    if (f.type.startsWith("image")) return <ImageIcon className="w-10 h-10 text-[#D4AF37]" />;
    if (f.type === "application/pdf") return <FileText className="w-10 h-10 text-[#D4AF37]" />;
    return <File className="w-10 h-10 text-[#D4AF37]" />;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= s ? "bg-[#D4AF37] text-white" : theme === "dark" ? "bg-[#112240] text-gray-400" : "bg-gray-200 text-gray-400"
              }`}
            >
              {step > s ? <Check className="w-5 h-5" /> : s}
            </div>
            <span className={`ml-2 text-sm hidden sm:inline ${step >= s ? "text-foreground" : muted(theme)}`}>
              {s === 1 ? t("teacherPublish.stepContent") : s === 2 ? t("teacherPublish.stepDetails") : t("teacherPublish.stepPublish")}
            </span>
            {s < 3 && <div className={`flex-1 h-1 mx-3 ${step > s ? "bg-[#D4AF37]" : theme === "dark" ? "bg-[#112240]" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
          <Card className={`p-6 md:p-8`}>
            <div className="space-y-6">
              <div>
                <label className={labelCls}>{t("teacherPublish.contentType")} *</label>
                <select value={form.content_type} onChange={(e) => setForm({ ...form, content_type: e.target.value })} className={selectCls(form.content_type)}>
                  {CONTENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>{t("teacherPublish.resourceFile")}</label>
                {!file ? (
                  <div
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer ${
                      theme === "dark" ? "border-white/20 hover:border-[#D4AF37]" : "border-gray-300 hover:border-[#D4AF37]"
                    }`}
                    onClick={() => fileRef.current?.click()}
                  >
                    <input ref={fileRef} type="file" className="hidden" onChange={handleFileSelect} accept={RESOURCE_FILE_ACCEPT} />
                    <Upload className={`w-12 h-12 mx-auto mb-3 text-text-muted`} />
                    <p className="text-foreground">{t("teacherPublish.dropFile")}</p>
                    <p className={`text-xs mt-2 ${muted(theme)}`}>{t("teacherPublish.fileTypesHint")}</p>
                  </div>
                ) : (
                  <div className={`flex items-center gap-4 p-4 rounded-xl border ${theme === "dark" ? "border-white/10 bg-[#0D1B2A]" : "border-gray-200 bg-gray-50"}`}>
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate text-foreground`}>{file.name}</p>
                      <p className={`text-sm ${muted(theme)}`}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setFile(null)}><X className="w-4 h-4" /></Button>
                  </div>
                )}
              </div>

              <div>
                <label className={labelCls}>{t("teacherPublish.externalUrl")}</label>
                <input type="url" value={form.external_url} onChange={(e) => setForm({ ...form, external_url: e.target.value })} className={inputCls} placeholder="https://..." />
              </div>

              <div>
                <label className={labelCls}>{t("teacherPublish.customThumbnail")}</label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div
                    className={`aspect-video rounded-xl border overflow-hidden relative cursor-pointer ${theme === "dark" ? "border-white/10 bg-[#0D1B2A]" : "border-gray-200 bg-gray-50"}`}
                    onClick={() => thumbRef.current?.click()}
                  >
                    <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnail} />
                    {thumbnailPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <ImageIcon className={`w-8 h-8 ${muted(theme)}`} />
                        <span className={`text-sm ${muted(theme)}`}>{t("teacherPublish.thumbnailHint")}</span>
                      </div>
                    )}
                  </div>
                  <div className={`text-sm ${muted(theme)} space-y-2`}>
                    <p>{t("teacherPublish.thumbnailHelp1")}</p>
                    <p>{t("teacherPublish.thumbnailHelp2")}</p>
                    {thumbnail && (
                      <Button variant="outline" size="sm" onClick={() => { setThumbnail(null); setThumbnailPreview(null); }}>{t("teacherPublish.removeThumbnail")}</Button>
                    )}
                  </div>
                </div>
              </div>

              <Button variant="gold" className="w-full" onClick={() => setStep(2)} disabled={!file && !form.external_url && !resourceId}>
                {t("teacherPublish.continue")} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
          <Card className={`p-6 md:p-8 space-y-5`}>
            <div>
              <label className={labelCls}>{t("teacherPublish.resourceTitle")} *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder={t("teacherPublish.titlePlaceholder")} />
            </div>
            <div>
              <label className={labelCls}>{t("teacherPublish.shortDescription")}</label>
              <input
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                className={inputCls}
                placeholder={t("teacherPublish.shortDescPlaceholder")}
                maxLength={200}
              />
            </div>
            <div>
              <label className={labelCls}>{t("teacherPublish.fullDescription")}</label>
              <textarea value={form.full_description} onChange={(e) => setForm({ ...form, full_description: e.target.value })} rows={5} className={`${inputCls} resize-none`} placeholder={t("teacherPublish.fullDescPlaceholder")} />
            </div>
            <div>
              <label className={labelCls}>{t("teacherPublish.category")}</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className={selectCls(form.category_id)}>
                <option value="">{t("teacherPublish.selectCategory")}</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t("teacherPublish.subject")} *</label>
                <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className={selectCls(form.subject_id)} required>
                  <option value="">{t("teacherPublish.selectSubject")}</option>
                  {catalogSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>{t("teacherPublish.semester")}</label>
                <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} className={selectCls(form.semester)}>
                  <option value="">{t("teacherPublish.anySemester")}</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>{t("teacherPublish.grade")} *</label>
              <p className={`mb-2 text-xs ${muted(theme)}`}>{t("teacherPublish.gradeHint")}</p>
              <div className="flex flex-wrap gap-2">
                {catalogClasses.map((cls) => {
                  const selected = form.class_ids.includes(cls.id);
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => toggleClass(cls.id)}
                      className={`rounded-full px-3 py-1.5 text-sm ${
                        selected
                          ? "bg-[#D4AF37] font-semibold text-[#0D1B2A]"
                          : muted(theme)
                      }`}
                      style={
                        selected
                          ? undefined
                          : { backgroundColor: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)" }
                      }
                    >
                      {cls.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className={labelCls}>{t("teacherPublish.tags")}</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-full text-sm ${form.tag_ids.includes(tag.id) ? "text-white" : muted(theme)}`}
                    style={{ backgroundColor: form.tag_ids.includes(tag.id) ? (tag.color || "#D4AF37") : theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)" }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t("teacherPublish.difficulty")}</label>
                <select value={form.difficulty_level} onChange={(e) => setForm({ ...form, difficulty_level: e.target.value })} className={selectCls(form.difficulty_level)}>
                  {DIFFICULTY_LEVELS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>{t("teacherPublish.ageRange")}</label>
                <select value={form.age_range} onChange={(e) => setForm({ ...form, age_range: e.target.value })} className={selectCls(form.age_range)}>
                  {AGE_RANGES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t("teacherPublish.estMinutes")}</label>
                <input type="number" min="1" value={form.estimated_minutes} onChange={(e) => setForm({ ...form, estimated_minutes: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t("teacherPublish.language")}</label>
                <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className={selectCls(form.language)}>
                  {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>{t("teacherPublish.back")}</Button>
              <Button
                variant="gold"
                className="flex-1"
                onClick={() => {
                  if (form.status === "published" && (!form.subject_id || form.class_ids.length === 0)) {
                    toastError(t("teacherPublish.errSubjectGrade"));
                    return;
                  }
                  setStep(3);
                }}
              >
                {t("teacherPublish.continue")} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
          <Card className={`p-6 md:p-8 space-y-6`}>
            <div>
              <label className={labelCls}>{t("teacherPublish.access")}</label>
              <div className="grid grid-cols-2 gap-3">
                {(["free", "premium"] as const).map((a) => (
                  <button key={a} type="button" onClick={() => setForm({ ...form, access_type: a })} className={`p-3 rounded-lg border text-sm capitalize ${form.access_type === a ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]" : theme === "dark" ? "border-white/10 text-white" : "border-gray-200"}`}>
                    {t(a === "free" ? "teacherPublish.free" : "teacherPublish.premium")}
                  </button>
                ))}
              </div>
            </div>
            {form.access_type === "premium" && (
              <div>
                <label className={labelCls}>{t("teacherPublish.price")}</label>
                <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} />
              </div>
            )}
            <div>
              <label className={labelCls}>{isAdmin ? t("teacherPublish.statusAdmin") : t("teacherPublish.publishing")}</label>
              {!isAdmin && (
                <p className={`mb-3 text-xs ${muted(theme)}`}>
                  {t("teacherPublish.reviewHint")}
                </p>
              )}
              {isAdmin && (
                <p className={`mb-3 text-xs ${muted(theme)}`}>
                  Published resources go live in the public Library immediately. Subject and grade are required.
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {(["draft", "published"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, status: s })}
                    className={`p-3 rounded-lg border text-sm font-medium ${form.status === s ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]" : theme === "dark" ? "border-white/10 text-white" : "border-gray-200"}`}
                  >
                    {isAdmin
                      ? s === "published"
                        ? t("teacherPublish.published")
                        : t("teacherPublish.draft")
                      : s === "published"
                        ? t("teacherPublish.submitForReview")
                        : t("teacherPublish.saveDraft")}
                  </button>
                ))}
              </div>
            </div>

            <div className={`rounded-xl border overflow-hidden border-border-default`}>
              <div className="aspect-video relative bg-[#0D1B2A]/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbnailPreview || DEFAULT_THUMBNAIL} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <p className="text-xs text-[#D4AF37] font-semibold">{categories.find((c) => c.id === form.category_id)?.name || t("teacherPublish.resourceFallback")}</p>
                <h4 className={`font-bold text-foreground`}>{form.title || t("teacherPublish.untitled")}</h4>
                <p className={`text-sm mt-1 ${muted(theme)}`}>{form.short_description || t("teacherPublish.shortDescPreview")}</p>
              </div>
            </div>

            {uploading && uploadProgress && (
              <PublishUploadProgress
                progress={uploadProgress}
                fileName={file?.name ?? form.title}
                theme={theme === "dark" ? "dark" : "light"}
              />
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)} disabled={uploading}>{t("teacherPublish.back")}</Button>
              <Button variant="gold" className="flex-1" onClick={handlePublish} disabled={uploading}>
                {uploading
                  ? uploadProgress?.phase === "processing"
                    ? t("teacherPublish.publishingProgress")
                    : uploadProgress?.phase === "uploading"
                      ? t("teacherPublish.uploadingProgress", { percent: uploadProgress.percent })
                      : t("teacherPublish.preparing")
                  : form.status === "published"
                    ? isAdmin
                      ? t("teacherPublish.publishNow")
                      : t("teacherPublish.submitForReview")
                    : t("teacherPublish.saveDraft")}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function muted(_theme: string) {
  return "text-text-muted";
}
