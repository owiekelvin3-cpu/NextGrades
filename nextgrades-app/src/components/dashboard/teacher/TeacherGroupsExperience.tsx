"use client";

import { useEffect, useState } from "react";
import { Users, Video, CalendarDays } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { TeacherDashboardLayout } from "./TeacherDashboardLayout";
import { teacherPanel } from "./teacher-ui";

type GroupMember = {
  id: string;
  studentId: string;
  name: string;
  email: string | null;
  joinedAt: string;
};

type TeacherGroup = {
  id: string;
  name: string;
  subject: { id: string; name: string } | null;
  class: { id: string; name: string; level: number | null } | null;
  scheduleNotes: string | null;
  meetingUrl: string | null;
  members: GroupMember[];
};

export function TeacherGroupsExperience() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<TeacherGroup[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/teacher/groups");
        const json = (await res.json()) as { groups?: TeacherGroup[] };
        if (!cancelled && res.ok) {
          setGroups(json.groups ?? []);
        }
      } catch {
        if (!cancelled) setGroups([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <TeacherDashboardLayout
      title={t("teacherDashboard.nav.groups")}
      description={t("teacherDashboard.groupsSubtitle", {
        defaultValue: "Gruppen, die dir von der Verwaltung zugewiesen wurden.",
      })}
    >
      <div className="mx-auto max-w-[1000px] space-y-4">
        {loading ? (
          <LoadingBlock />
        ) : groups.length === 0 ? (
          <div className={`${teacherPanel()} p-10 text-center`}>
            <Users className="mx-auto h-10 w-10 text-text-muted" />
            <p className="mt-4 text-sm text-text-muted">
              {t("teacherDashboard.groupsEmpty", {
                defaultValue: "Noch keine Gruppen zugewiesen. Die Verwaltung weist Gruppen zu.",
              })}
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.id} className={teacherPanel("p-5 sm:p-6")}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-foreground">{group.name}</h2>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-muted">
                    {group.subject?.name && (
                      <span className="rounded-full bg-surface-subtle px-2.5 py-1">{group.subject.name}</span>
                    )}
                    {group.class?.name && (
                      <span className="rounded-full bg-surface-subtle px-2.5 py-1">{group.class.name}</span>
                    )}
                    <span className="rounded-full bg-[var(--brand-gold-muted)] px-2.5 py-1 font-medium text-[#B8941F]">
                      {group.members.length}{" "}
                      {t("teacherDashboard.groupMembers", { defaultValue: "Mitglieder" })}
                    </span>
                  </div>
                </div>
                {group.meetingUrl && (
                  <a
                    href={group.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border-default px-3 py-2 text-sm font-medium text-foreground transition hover:border-[var(--brand-gold)]/40"
                  >
                    <Video className="h-4 w-4 text-[#2D8CFF]" />
                    Zoom
                  </a>
                )}
              </div>

              {group.scheduleNotes && (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-surface-subtle px-4 py-3 text-sm text-text-muted">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{group.scheduleNotes}</span>
                </div>
              )}

              {group.members.length > 0 && (
                <ul className="mt-4 divide-y divide-border-default rounded-xl border border-border-default">
                  {group.members.map((member) => (
                    <li key={member.id} className="flex items-center justify-between px-4 py-3 text-sm">
                      <span className="font-medium text-foreground">{member.name}</span>
                      {member.email && <span className="text-xs text-text-muted">{member.email}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
    </TeacherDashboardLayout>
  );
}
