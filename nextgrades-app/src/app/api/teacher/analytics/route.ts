import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/auth-utils";

// GET - Fetch analytics data for the current teacher
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const auth = await requireAuth(supabase);
    
    if (!auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // days
    const resourceId = searchParams.get("resourceId");

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Base query for teacher's resources
    let resourcesQuery = supabase
      .from("materials")
      .select("id, title, view_count, download_count, student_reach, revenue_generated")
      .eq("created_by", auth.user.id);

    if (resourceId) {
      resourcesQuery = resourcesQuery.eq("id", resourceId);
    }

    const { data: resources, error: resourcesError } = await resourcesQuery;

    if (resourcesError) throw resourcesError;

    // Calculate totals
    const totalUploads = resources?.length || 0;
    const totalViews = resources?.reduce((sum: number, r: any) => sum + (r.view_count || 0), 0) || 0;
    const totalDownloads = resources?.reduce((sum: number, r: any) => sum + (r.download_count || 0), 0) || 0;
    const totalStudentsReached = resources?.reduce((sum: number, r: any) => sum + (r.student_reach || 0), 0) || 0;
    const totalRevenue = resources?.reduce((sum: number, r: any) => sum + (r.revenue_generated || 0), 0) || 0;

    // Get analytics data for the period
    let analyticsQuery = supabase
      .from("resource_analytics")
      .select("created_at, action, resource_id")
      .gte("created_at", daysAgo.toISOString());

    if (resourceId) {
      analyticsQuery = analyticsQuery.eq("resource_id", resourceId);
    } else {
      // Only get analytics for teacher's resources
      const resourceIds = resources?.map((r: any) => r.id) || [];
      if (resourceIds.length > 0) {
        analyticsQuery = analyticsQuery.in("resource_id", resourceIds);
      } else {
        analyticsQuery = analyticsQuery.eq("resource_id", "00000000-0000-0000-0000-000000000000"); // No results
      }
    }

    const { data: analytics, error: analyticsError } = await analyticsQuery;

    if (analyticsError) throw analyticsError;

    // Group analytics by date for charts
    const analyticsByDate: Record<string, { views: number; downloads: number }> = {};
    
    analytics?.forEach((a: any) => {
      const date = new Date(a.created_at).toISOString().split('T')[0];
      if (!analyticsByDate[date]) {
        analyticsByDate[date] = { views: 0, downloads: 0 };
      }
      if (a.action === 'view') analyticsByDate[date].views++;
      if (a.action === 'download') analyticsByDate[date].downloads++;
    });

    // Get most viewed resources
    const { data: mostViewed } = await supabase
      .from("materials")
      .select("id, title, view_count, download_count, type, thumbnail_url")
      .eq("created_by", auth.user.id)
      .order("view_count", { ascending: false })
      .limit(5);

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from("resource_analytics")
      .select("created_at, action, resource_id, materials(title, type)")
      .gte("created_at", daysAgo.toISOString())
      .in("resource_id", resources?.map((r: any) => r.id) || [])
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      overview: {
        totalUploads,
        totalViews,
        totalDownloads,
        totalStudentsReached,
        totalRevenue
      },
      chartData: Object.entries(analyticsByDate).map(([date, data]) => ({
        date,
        ...data
      })),
      mostViewed: mostViewed || [],
      recentActivity: recentActivity || []
    });
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
