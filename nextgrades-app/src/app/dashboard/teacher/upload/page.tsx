"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { PublishContentForm } from "@/components/teacher/PublishContentForm";
import { useTheme } from "@/context/ThemeContext";

export default function TeacherPublishPage() {
  const { theme } = useTheme();

  return (
    <div className={`flex min-h-screen ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]"}`}>
      <Sidebar role="teacher" />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 md:pt-8">
        <div className="mb-8">
          <h1 className={`text-2xl md:text-3xl font-bold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
            Publish Content
          </h1>
          <p className={`mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            Upload and publish educational resources — they appear on the Resources page instantly when published.
          </p>
        </div>
        <PublishContentForm />
      </main>
    </div>
  );
}
