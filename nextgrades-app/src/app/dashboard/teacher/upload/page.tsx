"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Upload,
  X,
  FileText,
  Video,
  Image as ImageIcon,
  File,
  Check,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";

export default function TeacherUploadPage() {
  const { theme } = useTheme();
  const { success, error: toastError } = useToast();
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "pdf",
    category: "",
    tags: [] as string[],
    status: "draft",
    access_type: "free",
    price: "",
    subject_id: "",
    class_id: "",
    semester: "",
    publish_date: "",
    expiry_date: "",
  });

  const [categories, setCategories] = useState([
    { id: "worksheets", name: "Worksheets", icon: "file-text" },
    { id: "videos", name: "Videos", icon: "video" },
    { id: "notes", name: "Notes", icon: "book-open" },
    { id: "quizzes", name: "Quizzes", icon: "clipboard-check" },
    { id: "past_papers", name: "Past Papers", icon: "archive" },
    { id: "assignments", name: "Assignments", icon: "pen-tool" },
    { id: "courses", name: "Courses", icon: "layers" },
    { id: "other", name: "Other", icon: "more-horizontal" },
  ]);

  const [availableTags, setAvailableTags] = useState([
    { id: "math", name: "Mathematics", color: "#4DA3FF" },
    { id: "english", name: "English", color: "#22C55E" },
    { id: "german", name: "German", color: "#F97316" },
    { id: "physics", name: "Physics", color: "#A855F7" },
    { id: "chemistry", name: "Chemistry", color: "#EC4899" },
    { id: "biology", name: "Biology", color: "#14B8A6" },
    { id: "beginner", name: "Beginner", color: "#84CC16" },
    { id: "intermediate", name: "Intermediate", color: "#FBBF24" },
    { id: "advanced", name: "Advanced", color: "#F97316" },
  ]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setFormData({ ...formData, title: formData.title || file.name.replace(/\.[^/.]+$/, "") });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      setFormData({ ...formData, title: formData.title || file.name.replace(/\.[^/.]+$/, "") });
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  const handleSubmit = async () => {
    if (!uploadedFile) {
      toastError("Please select a file to upload");
      return;
    }

    if (!formData.title) {
      toastError("Please enter a title");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate file upload with progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(i);
      }

      // Create resource
      const response = await fetch("/api/teacher/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          url: "https://example.com/file", // In production, this would be the actual uploaded file URL
          thumbnail_url: null,
          file_size: uploadedFile.size,
          category_id: formData.category || null,
          tags: formData.tags,
          status: formData.status,
          access_type: formData.access_type,
          price: formData.access_type === "premium" ? parseFloat(formData.price) || 0 : 0,
          publish_date: formData.publish_date || null,
          expiry_date: formData.expiry_date || null,
        }),
      });

      if (response.ok) {
        success("Resource uploaded successfully!");
        // Reset form
        setUploadedFile(null);
        setFormData({
          title: "",
          description: "",
          type: "pdf",
          category: "",
          tags: [],
          status: "draft",
          access_type: "free",
          price: "",
          subject_id: "",
          class_id: "",
          semester: "",
          publish_date: "",
          expiry_date: "",
        });
        setStep(1);
      } else {
        const data = await response.json();
        toastError(data.error || "Failed to upload resource");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toastError("Failed to upload resource");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith("video")) return <Video className="w-12 h-12" />;
    if (type.startsWith("image")) return <ImageIcon className="w-12 h-12" />;
    if (type === "application/pdf") return <FileText className="w-12 h-12" />;
    return <File className="w-12 h-12" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className={`flex min-h-screen ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]"}`}>
      <Sidebar role="teacher" />
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 md:pt-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-2xl md:text-3xl font-bold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
              Upload Resource
            </h1>
            <p className={`mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Share your educational content with students
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= s
                      ? "bg-[#D4AF37] text-white"
                      : theme === "dark"
                      ? "bg-[#112240] text-gray-400"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                <div className={`ml-3 text-sm ${step >= s ? (theme === "dark" ? "text-white" : "text-[#0D1B2A]") : theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  {s === 1 ? "Upload File" : s === 2 ? "Details" : "Publish"}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-4 ${step > s ? "bg-[#D4AF37]" : theme === "dark" ? "bg-[#112240]" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: File Upload */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className={`p-8 ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
                {!uploadedFile ? (
                  <div
                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                      theme === "dark"
                        ? "border-white/20 hover:border-[#D4AF37] hover:bg-[#0D1B2A]/50"
                        : "border-gray-300 hover:border-[#D4AF37] hover:bg-gray-50"
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.avi,.jpg,.jpeg,.png,.gif"
                    />
                    <Upload className={`w-16 h-16 mx-auto mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                    <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                      Drag and drop your file here
                    </h3>
                    <p className={`mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      or click to browse
                    </p>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                      Supports: PDF, DOC, PPT, MP4, Images (Max 500MB)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={`flex items-center gap-4 p-4 rounded-xl border ${
                      theme === "dark" ? "border-white/10 bg-[#0D1B2A]" : "border-gray-200 bg-gray-50"
                    }`}>
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
                        {getFileIcon(uploadedFile)}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                          {uploadedFile.name}
                        </h4>
                        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          {formatFileSize(uploadedFile.size)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveFile}
                        className={theme === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-gray-200 text-gray-700 hover:bg-gray-50"}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      variant="gold"
                      size="md"
                      className="w-full"
                      onClick={() => setStep(2)}
                    >
                      Continue <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className={`p-8 ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === "dark"
                          ? "bg-[#0D1B2A] border-white/10 text-white placeholder-gray-500"
                          : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                      } focus:outline-none focus:ring-2 focus:ring-[#D4AF37]`}
                      placeholder="Enter resource title"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === "dark"
                          ? "bg-[#0D1B2A] border-white/10 text-white placeholder-gray-500"
                          : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                      } focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none`}
                      placeholder="Describe your resource..."
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                      Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat.id })}
                          className={`p-3 rounded-lg border text-sm transition-colors ${
                            formData.category === cat.id
                              ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                              : theme === "dark"
                              ? "border-white/10 text-white hover:bg-white/10"
                              : "border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            formData.tags.includes(tag.id)
                              ? "text-white"
                              : theme === "dark"
                              ? "text-gray-400 hover:text-white"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                          style={{
                            backgroundColor: formData.tags.includes(tag.id) ? tag.color : theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                          }}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Access Type */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                      Access Type
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {["free", "premium", "locked", "members_only"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, access_type: type })}
                          className={`p-3 rounded-lg border text-sm transition-colors ${
                            formData.access_type === type
                              ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                              : theme === "dark"
                              ? "border-white/10 text-white hover:bg-white/10"
                              : "border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {type.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price (for premium) */}
                  {formData.access_type === "premium" && (
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                        Price (€)
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        min="0"
                        step="0.01"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          theme === "dark"
                            ? "bg-[#0D1B2A] border-white/10 text-white placeholder-gray-500"
                            : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                        } focus:outline-none focus:ring-2 focus:ring-[#D4AF37]`}
                        placeholder="0.00"
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="md"
                      className="flex-1"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      variant="gold"
                      size="md"
                      className="flex-1"
                      onClick={() => setStep(3)}
                    >
                      Continue <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Publish */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className={`p-8 ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
                <div className="space-y-6">
                  {/* Status */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                      Status
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {["draft", "published", "scheduled"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setFormData({ ...formData, status })}
                          className={`p-3 rounded-lg border text-sm transition-colors ${
                            formData.status === status
                              ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                              : theme === "dark"
                              ? "border-white/10 text-white hover:bg-white/10"
                              : "border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {status.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Publish Date (for scheduled) */}
                  {formData.status === "scheduled" && (
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                        Publish Date
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.publish_date}
                        onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          theme === "dark"
                            ? "bg-[#0D1B2A] border-white/10 text-white"
                            : "bg-white border-gray-200 text-gray-900"
                        } focus:outline-none focus:ring-2 focus:ring-[#D4AF37]`}
                      />
                    </div>
                  )}

                  {/* Expiry Date */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                      Expiry Date (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        theme === "dark"
                          ? "bg-[#0D1B2A] border-white/10 text-white"
                          : "bg-white border-gray-200 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-[#D4AF37]`}
                    />
                  </div>

                  {/* Summary */}
                  <div className={`p-4 rounded-lg border ${theme === "dark" ? "border-white/10 bg-[#0D1B2A]" : "border-gray-200 bg-gray-50"}`}>
                    <h4 className={`font-semibold mb-3 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                      Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className={`flex justify-between ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        <span>Title:</span>
                        <span className={theme === "dark" ? "text-white" : "text-[#0D1B2A]"}>{formData.title}</span>
                      </div>
                      <div className={`flex justify-between ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        <span>Type:</span>
                        <span className={theme === "dark" ? "text-white" : "text-[#0D1B2A]"}>{formData.type.toUpperCase()}</span>
                      </div>
                      <div className={`flex justify-between ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        <span>Access:</span>
                        <span className={theme === "dark" ? "text-white" : "text-[#0D1B2A]"}>{formData.access_type.replace("_", " ")}</span>
                      </div>
                      {formData.access_type === "premium" && (
                        <div className={`flex justify-between ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          <span>Price:</span>
                          <span className="text-[#D4AF37] font-semibold">€{formData.price || "0.00"}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Progress */}
                  {uploading && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          Uploading...
                        </span>
                        <span className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                          {uploadProgress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#D4AF37] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="md"
                      className="flex-1"
                      onClick={() => setStep(2)}
                      disabled={uploading}
                    >
                      Back
                    </Button>
                    <Button
                      variant="gold"
                      size="md"
                      className="flex-1"
                      onClick={handleSubmit}
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : "Publish Resource"}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
