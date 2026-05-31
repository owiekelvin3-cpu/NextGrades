"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Video, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { fetchTeacherStudents, fetchSubjects, getSessionUserId } from "@/lib/dashboard/data";
import { ZOOM_MEETING_TYPES, type ZoomMeetingType } from "@/lib/zoom/config";
import { teacherPanel } from "@/components/dashboard/teacher/teacher-ui";

const TIMEZONES = ["Europe/Berlin", "Europe/Vienna", "Europe/Zurich", "Europe/London", "UTC"];

type Props = {
  onCreated?: () => void;
};

export function CreateLiveClassForm({ onCreated }: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    duration: "60",
    timezone: "Europe/Berlin",
    meetingType: "live_class" as ZoomMeetingType,
    studentId: "",
    subjectId: "",
  });

  useEffect(() => {
    void (async () => {
      const uid = await getSessionUserId();
      if (!uid) return;
      const [studentRows, subjectRows] = await Promise.all([
        fetchTeacherStudents(uid, "de"),
        fetchSubjects(),
      ]);
      setStudents(studentRows.map((s) => ({ id: s.id, name: s.name })));
      setSubjects(subjectRows.map((s) => ({ id: s.id, name: s.name })));
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        date: form.date,
        startTime: form.startTime,
        duration: Number(form.duration),
        timezone: form.timezone,
        meetingType: form.meetingType,
        subjectId: form.subjectId || undefined,
      };

      if (form.meetingType === "private_session") {
        body.studentId = form.studentId;
      } else if (form.subjectId) {
        body.subjectId = form.subjectId;
      } else if (form.studentId) {
        body.studentIds = [form.studentId];
      }

      const res = await fetch("/api/zoom/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create class");

      toast.success(t("zoom.classCreated", { defaultValue: "Live class created and students notified!" }));
      setForm((f) => ({ ...f, title: "", description: "", date: "", startTime: "" }));
      onCreated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("misc.errorGeneric", { defaultValue: "Something went wrong" }));
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#0D1B2A] outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]";

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className={`${teacherPanel()} space-y-4 p-6`}>
      <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
        <Video className="h-5 w-5 text-[#D4AF37]" />
        <h2 className="text-sm font-semibold text-[#0D1B2A]">
          {t("zoom.createLiveClass", { defaultValue: "Create live class" })}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            {t("zoom.meetingTitle", { defaultValue: "Meeting title" })}
          </label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputCls}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            {t("zoom.description", { defaultValue: "Description" })}
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`${inputCls} resize-none`}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            {t("zoom.meetingType", { defaultValue: "Meeting type" })}
          </label>
          <select
            value={form.meetingType}
            onChange={(e) => setForm({ ...form, meetingType: e.target.value as ZoomMeetingType })}
            className={inputCls}
          >
            {ZOOM_MEETING_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`zoom.types.${type}`, { defaultValue: type.replace(/_/g, " ") })}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            {t("zoom.timezone", { defaultValue: "Time zone" })}
          </label>
          <select
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            className={inputCls}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            {t("zoom.date", { defaultValue: "Date" })}
          </label>
          <input
            required
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            {t("zoom.startTime", { defaultValue: "Start time" })}
          </label>
          <input
            required
            type="time"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            {t("zoom.duration", { defaultValue: "Duration (minutes)" })}
          </label>
          <input
            type="number"
            min={15}
            max={480}
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            {t("zoom.subject", { defaultValue: "Subject" })}
          </label>
          <select
            value={form.subjectId}
            onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
            className={inputCls}
          >
            <option value="">{t("zoom.selectSubject", { defaultValue: "Select subject" })}</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            {form.meetingType === "private_session"
              ? t("zoom.student", { defaultValue: "Student" })
              : t("zoom.studentOptional", { defaultValue: "Student (optional)" })}
          </label>
          <select
            required={form.meetingType === "private_session"}
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            className={inputCls}
          >
            <option value="">{t("zoom.selectStudent", { defaultValue: "Select student" })}</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button type="submit" variant="gold" disabled={loading} className="w-full sm:w-auto">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Video className="mr-2 h-4 w-4" />}
        {t("zoom.createLiveClass", { defaultValue: "Create live class" })}
      </Button>
    </form>
  );
}
