"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Save,
  X,
  ArrowLeft,
  FileText,
  Video,
  Image as ImageIcon,
  File,
  Check,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useParams, useRouter } from "next/navigation";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string;
  thumbnail_url: string | null;
  status: string;
  access_type: string;
  price: number;
  category_id: string | null;
  tags: string[];
  publish_date: string | null;
  expiry_date: string | null;
}

export default function EditResourcePage() {
  const { theme } = useTheme();
  const { success, error: toastError } = useToast();
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resource, setResource] = useState<Resource | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "pdf",
    category_id: "",
    tags: [] as string[],
    status: "draft",
    access_type: "free",
    price: "",
    publish_date: "",
    expiry_date: "",
  });

  const [categories, setCategories] = useState([
    { id: "worksheets", name: "Worksheets" },
    { id: "videos", name: "Videos" },
    { id: "notes", name: "Notes" },
    { id: "quizzes", name: "Quizzes" },
    { id: "past_papers", name: "Past Papers" },
    { id: "assignments", name: "Assignments" },
    { id: "courses", name: "Courses" },
    { id: "other", name: "Other" },
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

  useEffect(() => {
    fetchResource();
  }, [params.id]);

  const fetchResource = async () => {
    try {
      const response = await fetch(`/api/teacher/resources/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setResource(data);
        setFormData({
          title: data.title,
          description: data.description || "",
          type: data.type,
          category_id: data.category_id || "",
          tags: data.tags || [],
          status: data.status,
          access_type: data.access_type,
          price: data.price ? data.price.toString() : "",
          publish_date: data.publish_date || "",
          expiry_date: data.expiry_date || "",
        });
      }
    } catch (error) {
      console.error("Error fetching resource:", error);
      toastError("Failed to load resource");
    } finally {
      setLoading(false);
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
    if (!formData.title) {
      toastError("Please enter a title");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/teacher/resources/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          category_id: formData.category_id || null,
          tags: formData.tags,
          status: formData.status,
          access_type: formData.access_type,
          price: formData.access_type === "premium" ? parseFloat(formData.price) || 0 : 0,
          publish_date: formData.publish_date || null,
          expiry_date: formData.expiry_date || null,
        }),
      });

      if (response.ok) {
        success("Resource updated successfully!");
        router.push("/dashboard/teacher/content");
      } else {
        toastError("Failed to update resource");
      }
    } catch (error) {
      console.error("Update error:", error);
      toastError("Failed to update resource");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-500/10 text-green-500";
      case "draft": return "bg-gray-500/10 text-gray-500";
      case "pending_review": return "bg-yellow-500/10 text-yellow-500";
      case "private": return "bg-purple-500/10 text-purple-500";
      case "scheduled": return "bg-blue-500/10 text-blue-500";
      case "archived": return "bg-red-500/10 text-red-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  if (loading) {
    return (
      <div className={`flex min-h-screen ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]"}`}>
        <Sidebar role="teacher" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 md:pt-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]"}`}>
      <Sidebar role="teacher" />
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 md:pt-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className={theme === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-gray-200 text-gray-700 hover:bg-gray-50"}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div>
                <h1 className={`text-2xl md:text-3xl font-bold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                  Edit Resource
                </h1>
                <p className={`mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Update your resource details
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(formData.status)}>
              {formData.status.replace("_", " ")}
            </Badge>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
                        onClick={() => setFormData({ ...formData, category_id: cat.id })}
                        className={`p-3 rounded-lg border text-sm transition-colors ${
                          formData.category_id === cat.id
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

                {/* Status */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                    Status
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {["draft", "published", "pending_review", "private", "scheduled", "archived"].map((status) => (
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

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="md"
                    className="flex-1"
                    onClick={() => router.back()}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="gold"
                    size="md"
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
