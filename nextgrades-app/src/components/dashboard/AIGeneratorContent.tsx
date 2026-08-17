"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UploadCloud, FileText, Sparkles, CheckCircle2, FileUp, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { themeInputClass, themeSelectCompactClass } from "@/lib/theme/form-fields";
import { cn } from "@/lib/utils";
import { TEACHER_PUBLISHING_ENABLED } from "@/lib/resources/teacher-publishing";

type UploadedMaterial = {
  id: string;
  title: string;
  file_name: string | null;
  file_type: string;
  extraction_status: string;
  created_at: string;
};

type GeneratedQuiz = {
  id: string;
  title: string;
  quiz_questions?: { id: string; question_text: string }[];
};

export function AIGeneratorContent() {
  const [materials, setMaterials] = useState<UploadedMaterial[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);
  const [publishedQuizzes, setPublishedQuizzes] = useState<{ id: string; title: string; is_published?: boolean }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const subjects = useLocalizedContent<string[]>("aiGeneratorPage.subjects");
  const grades = useLocalizedContent<string[]>("aiGeneratorPage.grades");

  const loadMaterials = useCallback(async () => {
    setLoadingMaterials(true);
    try {
      const res = await fetch("/api/quiz/materials");
      if (!res.ok) throw new Error((await res.json()).error || "Failed to load materials");
      const data = (await res.json()) as UploadedMaterial[];
      setMaterials(data);
      if (data.length && !selectedMaterialId) {
        const ready = data.find((m) => m.extraction_status === "ready");
        setSelectedMaterialId(ready?.id ?? data[0].id);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load materials");
    } finally {
      setLoadingMaterials(false);
    }
  }, [selectedMaterialId, toast]);

  const loadQuizzes = useCallback(async () => {
    const res = await fetch("/api/quiz/quizzes");
    if (!res.ok) return;
    const data = (await res.json()) as { id: string; title: string; is_published?: boolean }[];
    if (Array.isArray(data)) setPublishedQuizzes(data.filter((q) => q.is_published !== false));
  }, []);

  useEffect(() => {
    loadMaterials();
    void loadQuizzes();
  }, [loadMaterials, loadQuizzes]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("title", file.name.replace(/\.[^.]+$/, "") || file.name);
      form.append("difficulty", difficulty);

      const res = await fetch("/api/quiz/materials", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      toast.success(t("aiGeneratorPage.uploadSuccess", { defaultValue: "Material uploaded successfully" }));
      await loadMaterials();
      if (data.id) setSelectedMaterialId(data.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    const res = await fetch(`/api/quiz/materials/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error((await res.json()).error || "Delete failed");
      return;
    }
    toast.success(t("aiGeneratorPage.deleted", { defaultValue: "Material removed" }));
    if (selectedMaterialId === id) setSelectedMaterialId("");
    await loadMaterials();
  };

  const handleGenerate = async (mode: "quiz" | "flashcards" = "quiz") => {
    const notes = pasteText.trim();
    if (!selectedMaterialId && notes.length < 80) {
      toast.error(
        t("aiGeneratorPage.pasteRequired", {
          defaultValue: "Paste at least a short lesson text, or upload a file.",
        })
      );
      return;
    }

    const material = materials.find((m) => m.id === selectedMaterialId);
    if (selectedMaterialId && material?.extraction_status !== "ready") {
      toast.error(t("aiGeneratorPage.materialProcessing", { defaultValue: "Material is still being processed" }));
      return;
    }

    setIsGenerating(true);
    setGeneratedQuiz(null);
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId: selectedMaterialId || undefined,
          sourceText: selectedMaterialId ? undefined : notes,
          mode,
          topic: topic || undefined,
          difficulty,
          questionCount,
          title: title || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      if (data.quiz) {
        setGeneratedQuiz(data.quiz);
        toast.success(
          t("aiGeneratorPage.generatedPublished", {
            defaultValue: "Quiz generated and published for students.",
          })
        );
        void loadQuizzes();
      } else if (data.jobId) {
        const jobRes = await fetch(`/api/quiz/jobs/${data.jobId}`);
        const jobData = await jobRes.json();
        if (jobData.quiz) {
          setGeneratedQuiz(jobData.quiz);
          toast.success(t("aiGeneratorPage.generatedTitle", { defaultValue: "Quiz generated successfully!" }));
          void loadQuizzes();
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectClass = (value: string) => themeSelectCompactClass(value, "w-full rounded-xl py-3");
  const fieldClass = themeInputClass;

  const readyMaterials = materials.filter((m) => m.extraction_status === "ready");
  const canGenerate = Boolean(selectedMaterialId && readyMaterials.some((m) => m.id === selectedMaterialId)) || pasteText.trim().length >= 80;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`p-8`}>
            <h2 className={`mb-6 text-xl font-bold text-foreground`}>
              {t("aiGeneratorPage.step1Paste", { defaultValue: "1. Lesson notes or file" })}
            </h2>
            <p className="mb-4 text-sm text-text-muted">
              {t("aiGeneratorPage.step1PasteHint", {
                defaultValue: "Paste the lesson text. The quiz is published for students under Tasks.",
              })}
            </p>
            <textarea
              rows={6}
              value={pasteText}
              onChange={(e) => {
                setPasteText(e.target.value);
                if (e.target.value.trim()) setSelectedMaterialId("");
              }}
              placeholder={t("aiGeneratorPage.pastePlaceholder", {
                defaultValue: "e.g. Quadratic equations: ax² + bx + c = 0. The discriminant is b² − 4ac…",
              })}
              className={cn(fieldClass, "mb-6 resize-y")}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
                e.target.value = "";
              }}
            />
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 ${
                theme === "dark" ? "border-white/20" : "border-gray-300"
              }`}
            >
              <UploadCloud className="mx-auto mb-4 h-8 w-8 text-[#D4AF37]" />
              <p className={`mb-1 font-semibold text-foreground`}>
                {t("aiGeneratorPage.uploadTitle")}
              </p>
              <p className={`text-sm text-text-muted`}>
                {t("aiGeneratorPage.uploadHint")}
              </p>
              <Button
                variant="gold"
                className="mt-6"
                type="button"
                disabled={isUploading}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <FileUp className="mr-2 h-5 w-5" />
                {isUploading ? t("aiGeneratorPage.uploading", { defaultValue: "Uploading…" }) : t("aiGeneratorPage.selectFile")}
              </Button>
            </div>

            {loadingMaterials ? (
              <div className="mt-6">
                <LoadingBlock />
              </div>
            ) : materials.length > 0 ? (
              <div className="mt-6 space-y-2">
                <p className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  {t("aiGeneratorPage.yourMaterials", { defaultValue: "Your materials" })}
                </p>
                {materials.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                      selectedMaterialId === m.id ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-gray-200"
                    }`}
                  >
                    <button
                      type="button"
                      className="flex flex-1 items-center gap-3 text-left"
                      onClick={() => setSelectedMaterialId(m.id)}
                    >
                      <FileText className="h-5 w-5 shrink-0 text-[#D4AF37]" />
                      <div>
                        <p className="font-medium">{m.title}</p>
                        <p className="text-xs text-gray-500">
                          {m.extraction_status === "ready"
                            ? t("aiGeneratorPage.ready", { defaultValue: "Ready" })
                            : m.extraction_status}
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMaterial(m.id)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete material"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className={`p-8`}>
            <h2 className={`mb-6 text-xl font-bold text-foreground`}>
              {t("aiGeneratorPage.step2")}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className={`mb-2 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  {t("aiGeneratorPage.subject")}
                </label>
                <select className={selectClass(topic)} value={topic} onChange={(e) => setTopic(e.target.value)}>
                  <option value="">{t("aiGeneratorPage.selectSubject", { defaultValue: "Optional topic" })}</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`mb-2 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  {t("aiGeneratorPage.grade")}
                </label>
                <select className={selectClass("")} defaultValue="">
                  {grades.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`mb-2 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  {t("aiGeneratorPage.difficulty", { defaultValue: "Difficulty" })}
                </label>
                <select
                  className={selectClass(difficulty)}
                  onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
                >
                  <option value="easy">{t("aiGeneratorPage.easy", { defaultValue: "Easy" })}</option>
                  <option value="medium">{t("aiGeneratorPage.medium", { defaultValue: "Medium" })}</option>
                  <option value="hard">{t("aiGeneratorPage.hard", { defaultValue: "Hard" })}</option>
                </select>
              </div>
              <div>
                <label className={`mb-2 block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  {t("aiGeneratorPage.questionCount", { defaultValue: "Questions" })}
                </label>
                <input
                  type="number"
                  min={5}
                  max={30}
                  className={fieldClass}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                />
              </div>
            </div>
            <input
              className={cn(fieldClass, "mt-4")}
              placeholder={t("aiGeneratorPage.quizTitle", { defaultValue: "Quiz title (optional)" })}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Button
              variant="gold"
              size="xl"
              className="mt-8 w-full"
              onClick={() => handleGenerate("quiz")}
              disabled={isGenerating || !canGenerate}
            >
              {isGenerating ? (
                <>
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-[#0D1B2A] border-t-transparent" />
                  {t("aiGeneratorPage.generating")}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" /> {t("aiGeneratorPage.publishQuiz", { defaultValue: "Create & publish quiz" })}
                </>
              )}
            </Button>
          </Card>
        </motion.div>

        {generatedQuiz && (
          <Card className={`p-8`}>
            <h3 className={`mb-4 text-lg font-bold text-foreground`}>
              {generatedQuiz.title}
            </h3>
            <ul className="space-y-3">
              {(generatedQuiz.quiz_questions || []).slice(0, 5).map((q, i) => (
                <li key={q.id} className="flex gap-2 text-sm">
                  <span className="font-semibold text-[#D4AF37]">{i + 1}.</span>
                  <span>{q.question_text}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="mt-4" href="/dashboard/student/quizzes">
              {t("aiGeneratorPage.viewAsStudent", { defaultValue: "Students see this under Tasks" })}
            </Button>
          </Card>
        )}
      </div>

      <div className="space-y-8">
        <Card className={`p-6`}>
          <h3 className={`mb-4 font-semibold text-foreground`}>
            {t("aiGeneratorPage.quickAccess")}
          </h3>
          <div className="space-y-3">
            <Button
              variant="secondary"
              className="w-full justify-start"
              size="md"
              type="button"
              disabled={isGenerating || !canGenerate}
              onClick={() => handleGenerate("flashcards")}
            >
              <FileText className="mr-3 h-5 w-5" /> {t("aiGeneratorPage.flashcards")}
            </Button>
            <Button variant="secondary" className="w-full justify-start" size="md" type="button" href="/dashboard/teacher/content">
              <Sparkles className="mr-3 h-5 w-5" /> {t("aiGeneratorPage.summary", { defaultValue: "Content library" })}
            </Button>
            {TEACHER_PUBLISHING_ENABLED && (
              <Button variant="secondary" className="w-full justify-start" size="md" type="button" href="/dashboard/teacher/upload">
                <Sparkles className="mr-3 h-5 w-5" /> {t("aiGeneratorPage.exercises", { defaultValue: "Upload resources" })}
              </Button>
            )}
          </div>
        </Card>

        {publishedQuizzes.length > 0 && (
          <Card className="p-6">
            <h3 className="mb-3 font-semibold text-foreground">
              {t("aiGeneratorPage.publishedForStudents", { defaultValue: "Published for students" })}
            </h3>
            <ul className="space-y-2 text-sm">
              {publishedQuizzes.slice(0, 8).map((q) => (
                <li key={q.id} className="rounded-lg border border-border-default px-3 py-2 text-foreground">
                  {q.title}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-text-muted">
              {t("aiGeneratorPage.studentsFindQuizzes", {
                defaultValue: "Students open these under Tasks.",
              })}
            </p>
          </Card>
        )}

        <Card className={`p-6 ${theme === "dark" ? "bg-[#112240] border border-[#D4AF37]/30" : "border border-blue-200 bg-blue-50"}`}>
          <h3 className={`mb-3 font-semibold text-foreground`}>
            {t("aiGeneratorPage.tipsTitle")}
          </h3>
          <ul className={`space-y-2 text-sm text-text-muted`}>
            {[t("aiGeneratorPage.tip1"), t("aiGeneratorPage.tip2"), t("aiGeneratorPage.tip3")].map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" />
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
