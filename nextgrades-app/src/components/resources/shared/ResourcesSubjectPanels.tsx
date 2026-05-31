"use client";

import Link from "next/link";
import { ChevronRight, Download, Lock, Play, HelpCircle, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { contentTypeLabel } from "@/lib/resources/constants";
import type { LearningResource } from "@/components/resources/ResourceLearningCard";

export function ResourcesRightSidebar({ resources }: { resources: LearningResource[] }) {
  const { t } = useTranslation();
  const total = resources.length;
  const completed = Math.min(Math.round(total * 0.35), total);
  const pct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <aside className="space-y-5">
      <div className="rounded-2xl bg-[#0D1B2A] p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#D4AF37]">Your progress</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="3"
                strokeDasharray={`${pct} 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-bold">{pct}%</span>
          </div>
          <div>
            <p className="text-sm font-semibold">{completed} of {total} materials</p>
            <p className="text-xs text-gray-400">completed</p>
          </div>
        </div>
        <Link href="/dashboard/student/progress" className="mt-4 block text-center text-xs font-semibold text-[#D4AF37] hover:underline">
          View progress →
        </Link>
      </div>

      <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-5">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
          <Lock className="h-5 w-5 text-purple-600" />
        </div>
        <h3 className="font-bold text-[#0D1B2A]">Unlock more content</h3>
        <ul className="mt-3 space-y-2 text-xs text-gray-600">
          {["All premium materials", "Learning videos", "Exam preparation", "Personal support"].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="text-[#D4AF37]">✓</span> {item}
            </li>
          ))}
        </ul>
        <Link
          href="/resources/upgrade"
          className="mt-4 block rounded-xl bg-[#D4AF37] px-4 py-2.5 text-center text-sm font-bold text-[#0D1B2A]"
        >
          Upgrade now
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
          <Sparkles className="h-4 w-4 text-amber-500" />
        </div>
        <h3 className="text-sm font-bold text-[#0D1B2A]">Did you know?</h3>
        <p className="mt-2 text-xs text-gray-500">
          Regular short study sessions are more effective than cramming before exams.
        </p>
        <Link href="/help" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#D4AF37]">
          Learning tips <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  );
}

export function ResourcesChapterList({
  chapters,
}: {
  chapters: { name: string; count: number; description?: string }[];
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-bold text-[#0D1B2A]">Chapter overview</h2>
      <ul className="divide-y divide-gray-100">
        {chapters.slice(0, 8).map((ch, i) => (
          <li key={ch.name} className="flex items-center gap-4 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-sm font-bold text-purple-600">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#0D1B2A]">{ch.name}</p>
              <p className="text-xs text-gray-500">{ch.count} materials</p>
            </div>
            <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
              {ch.count} items
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ResourcesMaterialsTable({
  resources,
  onOpen,
}: {
  resources: LearningResource[];
  onOpen: (r: LearningResource) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-base font-bold text-[#0D1B2A]">Latest materials</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-xs uppercase tracking-wide text-gray-400">
              <th className="px-5 py-3 font-semibold">Title</th>
              <th className="px-3 py-3 font-semibold">Type</th>
              <th className="px-3 py-3 font-semibold hidden md:table-cell">Chapter</th>
              <th className="px-3 py-3 font-semibold hidden lg:table-cell">Grade</th>
              <th className="px-3 py-3 font-semibold hidden lg:table-cell">Access</th>
              <th className="px-5 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {resources.slice(0, 10).map((r) => {
              const locked = r.locked ?? (r.is_premium && !r.canAccess);
              const isVideo = (r.content_type || "").includes("video");
              return (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-[#0D1B2A] line-clamp-1">{r.title}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{r.short_description}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase">
                      {contentTypeLabel(r.content_type || r.type || "resource")}
                    </span>
                  </td>
                  <td className="px-3 py-3 hidden md:table-cell text-gray-500">{r.category?.name || "—"}</td>
                  <td className="px-3 py-3 hidden lg:table-cell text-gray-500">{r.class?.name || "—"}</td>
                  <td className="px-3 py-3 hidden lg:table-cell">
                    {locked ? (
                      <span className="text-xs font-semibold text-[#D4AF37]">Premium</span>
                    ) : (
                      <span className="text-xs font-semibold text-[#22C55E]">Free</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onOpen(r)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                    >
                      {locked ? <Lock className="h-4 w-4" /> : isVideo ? <Play className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {resources.length === 0 && (
        <p className="px-5 py-8 text-center text-sm text-gray-500">No materials found.</p>
      )}
    </div>
  );
}

export function ResourcesSupportBar() {
  return (
    <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white px-6 py-5 sm:flex-row">
      <div className="flex items-center gap-3">
        <HelpCircle className="h-5 w-5 text-[#D4AF37]" />
        <p className="text-sm text-gray-600">Questions about materials? Our team is happy to help.</p>
      </div>
      <Link href="/contact" className="rounded-xl border-2 border-[#D4AF37] px-5 py-2 text-sm font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/5">
        Contact us
      </Link>
    </div>
  );
}
