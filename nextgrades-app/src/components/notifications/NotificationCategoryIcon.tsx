"use client";

import {
  Megaphone,
  FileText,
  Video,
  ClipboardList,
  Award,
  MessageSquare,
  User,
  BookOpen,
  GraduationCap,
  Upload,
  Bell,
  Info,
  type LucideIcon,
} from "lucide-react";
import type { NotificationCategory, NotificationType } from "@/lib/notifications/types";
import { categoryAccent, typeAccent } from "@/lib/notifications/format";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<NotificationCategory, LucideIcon> = {
  announcement: Megaphone,
  resource: FileText,
  live_class: Video,
  assignment: ClipboardList,
  grade: Award,
  message: MessageSquare,
  account: User,
  course: BookOpen,
  exam: GraduationCap,
  enrollment: GraduationCap,
  submission: Upload,
  system: Bell,
};

type Props = {
  category: NotificationCategory;
  type?: NotificationType | string;
  size?: "sm" | "md";
  className?: string;
};

export function NotificationCategoryIcon({ category, type = "info", size = "md", className }: Props) {
  const Icon = CATEGORY_ICONS[category] ?? Info;
  const accent = categoryAccent(category) || typeAccent(type);

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl ring-1 ring-inset",
        size === "sm" ? "h-9 w-9" : "h-11 w-11",
        accent,
        className
      )}
    >
      <Icon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
    </span>
  );
}
