import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-auth";

export async function GET(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  const { searchParams } = new URL(request.url);
  const activityLimit = Math.min(20, Math.max(1, parseInt(searchParams.get("activityLimit") || "10", 10)));

  const db = gate.auth!.supabase;

  const [students, teachers, enrollments, earnings, activityResult] = await Promise.all([
    db.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    db.from("profiles").select("*", { count: "exact", head: true }).eq("role", "teacher"),
    db.from("enrollments").select("*", { count: "exact", head: true }).eq("status", "active"),
    db.from("teacher_stats").select("earnings_mtd"),
    db
      .from("activity_logs")
      .select("id, action, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(activityLimit),
  ]);

  const totalEarnings = (earnings.data || []).reduce(
    (sum: number, row: { earnings_mtd: number }) => sum + Number(row.earnings_mtd ?? 0),
    0
  );

  type ActivityRow = { id: string; action: string; metadata: unknown; created_at: string };
  const activities = ((activityResult.data || []) as ActivityRow[]).map((row) => {
    const meta = (row.metadata as Record<string, string> | null) ?? {};
    let type: "success" | "info" | "warning" = "info";
    if (row.action.includes("payment") || row.action.includes("success")) type = "success";
    if (row.action.includes("warning") || row.action.includes("pending")) type = "warning";
    return {
      id: row.id,
      type,
      title: meta.title || row.action,
      time: new Date(row.created_at).toLocaleString(),
    };
  });

  return NextResponse.json(
    {
      stats: {
        total_students: students.count ?? 0,
        total_teachers: teachers.count ?? 0,
        active_enrollments: enrollments.count ?? 0,
        total_earnings: totalEarnings,
      },
      activities,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=20, stale-while-revalidate=60",
      },
    }
  );
}
