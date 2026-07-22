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
import { xhrUploadJson, type UploadProgressSnapshot } from "@/lib/upload/xhr-upload";
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
};

type FormState = {
  title: string;
  short_description: string;
  full_description: string;
  content_type: string;
  category_id: string;
  subject_id: string;
  class_id: string;
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

export function PublishContentForm({ resourceId, initialData }: PublishContentFormProps) {
  const { theme } = useTheme();
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
  const [form, setForm] = useState<FormState>({ ...defaultForm, ...initialData });
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
      if (Array.isArray(catalog?.classes)) setCatalogClasses(catalog.classes);
    });
  }, []);

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
      toastError("Please enter a title");
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
        toastError("Thumbnail must be JPG, PNG, or WebP.");
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
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("short_description", form.short_description.trim());
      fd.append("full_description", form.full_description.trim());
      fd.append("content_type", form.content_type);
      if (form.category_id) fd.append("category_id", form.category_id);
      if (form.subject_id) fd.append("subject_id", form.subject_id);
      if (form.class_id) fd.append("class_id", form.class_id);
      if (form.semester) fd.append("semester", form.semester);
      fd.append("tag_ids", JSON.stringify(form.tag_ids));
      fd.append("difficulty_level", form.difficulty_level);
      fd.append("age_range", form.age_range);
      if (form.estimated_minutes) fd.append("estimated_minutes", form.estimated_minutes);
      fd.append("language", form.language);
      fd.append("status", form.status);
      fd.append("access_type", form.access_type);
      if (form.access_type === "premium") fd.append("price", form.price || "0");
      if (form.external_url) fd.append("external_url", form.external_url);
      if (file) fd.append("file", file);
      if (thumbnail) fd.append("thumbnail", thumbnail);
      if (resourceId) fd.append("resource_id", resourceId);

      const result = await xhrUploadJson<{ error?: string; moderation_status?: string; status?: string }>(
        "/api/teacher/publish",
        fd,
        setUploadProgress
      );

      if (!result.ok) {
        toastError(result.data?.error || "Failed to publish");
        return;
      }

      const submittedForReview =
        form.status === "published" && result.data?.moderation_status === "pending";
      success(
        submittedForReview
          ? "Submitted for review. An admin will approve it before it goes live."
          : form.status === "published"
            ? "Resource published! It is now live on the Resources page."
            : "Draft saved successfully."
      );
      router.push("/dashboard/teacher/content");
    } catch {
      toastError("Upload failed. Please try again.");
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
              {s === 1 ? "Content & File" : s === 2 ? "Details" : "Publish"}
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
                <label className={labelCls}>Content Type *</label>
                <select value={form.content_type} onChange={(e) => setForm({ ...form, content_type: e.target.value })} className={selectCls(form.content_type)}>
                  {CONTENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Resource File</label>
                {!file ? (
                  <div
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer ${
                      theme === "dark" ? "border-white/20 hover:border-[#D4AF37]" : "border-gray-300 hover:border-[#D4AF37]"
                    }`}
                    onClick={() => fileRef.current?.click()}
                  >
                    <input ref={fileRef} type="file" className="hidden" onChange={handleFileSelect} accept={RESOURCE_FILE_ACCEPT} />
                    <Upload className={`w-12 h-12 mx-auto mb-3 text-text-muted`} />
                    <p className="text-foreground">Drop file or click to browse (max 50MB)</p>
                    <p className={`text-xs mt-2 ${muted(theme)}`}>PDF, video, Word, PowerPoint, Excel, images, text</p>
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
                <label className={labelCls}>External URL (optional for live classes / articles)</label>
                <input type="url" value={form.external_url} onChange={(e) => setForm({ ...form, external_url: e.target.value })} className={inputCls} placeholder="https://..." />
              </div>

              <div>
                <label className={labelCls}>Custom Thumbnail</label>
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
                        <span className={`text-sm ${muted(theme)}`}>16:9 preview - click to upload</span>
                      </div>
                    )}
                  </div>
                  <div className={`text-sm ${muted(theme)} space-y-2`}>
                    <p>Recommended: 960×540 or larger, JPG/PNG/WebP.</p>
                    <p>Images are compressed automatically. If none is uploaded, a default learning card thumbnail is used.</p>
                    {thumbnail && (
                      <Button variant="outline" size="sm" onClick={() => { setThumbnail(null); setThumbnailPreview(null); }}>Remove thumbnail</Button>
                    )}
                  </div>
                </div>
              </div>

              <Button variant="gold" className="w-full" onClick={() => setStep(2)} disabled={!file && !form.external_url && !resourceId}>
                Continue <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
          <Card className={`p-6 md:p-8 space-y-5`}>
            <div>
              <label className={labelCls}>Resource Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="Enter title" />
            </div>
            <div>
              <label className={labelCls}>Short Description</label>
              <input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} className={inputCls} placeholder="Brief summary for cards" maxLength={200} />
            </div>
            <div>
              <label className={labelCls}>Full Description</label>
              <textarea value={form.full_description} onChange={(e) => setForm({ ...form, full_description: e.target.value })} rows={5} className={`${inputCls} resize-none`} placeholder="Detailed description..." />
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className={selectCls(form.category_id)}>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Subject</label>
                <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className={selectCls(form.subject_id)}>
                  <option value="">Any subject</option>
                  {catalogSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Grade</label>
                <select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} className={selectCls(form.class_id)}>
                  <option value="">Any grade</option>
                  {catalogClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Semester</label>
                <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} className={selectCls(form.semester)}>
                  <option value="">Any semester</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Tags</label>
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
                <label className={labelCls}>Difficulty</label>
                <select value={form.difficulty_level} onChange={(e) => setForm({ ...form, difficulty_level: e.target.value })} className={selectCls(form.difficulty_level)}>
                  {DIFFICULTY_LEVELS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Age Range</label>
                <select value={form.age_range} onChange={(e) => setForm({ ...form, age_range: e.target.value })} className={selectCls(form.age_range)}>
                  {AGE_RANGES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Est. Completion (minutes)</label>
                <input type="number" min="1" value={form.estimated_minutes} onChange={(e) => setForm({ ...form, estimated_minutes: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Language</label>
                <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className={selectCls(form.language)}>
                  {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button variant="gold" className="flex-1" onClick={() => setStep(3)}>Continue <ArrowRight className="w-5 h-5 ml-2" /></Button>
            </div>
          </Card>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
          <Card className={`p-6 md:p-8 space-y-6`}>
            <div>
              <label className={labelCls}>Access</label>
              <div className="grid grid-cols-2 gap-3">
                {["free", "premium"].map((a) => (
                  <button key={a} type="button" onClick={() => setForm({ ...form, access_type: a })} className={`p-3 rounded-lg border text-sm capitalize ${form.access_type === a ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]" : theme === "dark" ? "border-white/10 text-white" : "border-gray-200"}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            {form.access_type === "premium" && (
              <div>
                <label className={labelCls}>Price (€)</label>
                <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} />
              </div>
            )}
            <div>
              <label className={labelCls}>Status</label>
              <div className="grid grid-cols-2 gap-3">
                {["draft", "published"].map((s) => (
                  <button key={s} type="button" onClick={() => setForm({ ...form, status: s })} className={`p-3 rounded-lg border text-sm capitalize ${form.status === s ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]" : theme === "dark" ? "border-white/10 text-white" : "border-gray-200"}`}>
                    {s}
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
                <p className="text-xs text-[#D4AF37] font-semibold">{categories.find((c) => c.id === form.category_id)?.name || "Resource"}</p>
                <h4 className={`font-bold text-foreground`}>{form.title || "Untitled resource"}</h4>
                <p className={`text-sm mt-1 ${muted(theme)}`}>{form.short_description || "Short description preview"}</p>
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
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)} disabled={uploading}>Back</Button>
              <Button variant="gold" className="flex-1" onClick={handlePublish} disabled={uploading}>
                {uploading
                  ? uploadProgress?.phase === "processing"
                    ? "Publishing…"
                    : uploadProgress?.phase === "uploading"
                      ? `Uploading ${uploadProgress.percent}%`
                      : "Preparing…"
                  : form.status === "published"
                    ? "Publish Now"
                    : "Save Draft"}
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
