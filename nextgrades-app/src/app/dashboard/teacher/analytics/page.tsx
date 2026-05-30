"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TeacherDashboardLayout } from "@/components/dashboard/teacher/TeacherDashboardLayout";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Download,
  Users,
  DollarSign,
  Calendar,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface AnalyticsData {
  overview: {
    totalUploads: number;
    totalViews: number;
    totalDownloads: number;
    totalStudentsReached: number;
    totalRevenue: number;
  };
  chartData: Array<{
    date: string;
    views: number;
    downloads: number;
  }>;
  mostViewed: Array<{
    id: string;
    title: string;
    view_count: number;
    download_count: number;
    type: string;
    thumbnail_url: string | null;
  }>;
  recentActivity: Array<{
    created_at: string;
    action: string;
    resource_id: string;
    materials: {
      title: string;
      type: string;
    } | null;
  }>;
}

export default function TeacherAnalyticsPage() {
  const { theme } = useTheme();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    void fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const response = await fetch(`/api/teacher/analytics?period=${period}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load analytics");
      }
      setAnalytics(data);
    } catch (error) {
      setAnalytics(null);
      setFetchError(error instanceof Error ? error.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return "€" + num.toFixed(2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const maxValue = Math.max(
    ...(analytics?.chartData.map(d => Math.max(d.views, d.downloads)) || [1])
  );

  return (
    <TeacherDashboardLayout title="Analytics">
      <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
              Track your content performance
            </p>
            <div className="flex gap-2">
              {["7", "30", "90"].map((days) => (
                <Button
                  key={days}
                  variant={period === days ? "gold" : "outline"}
                  size="sm"
                  onClick={() => setPeriod(days)}
                  className={period !== days ? (theme === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-gray-200 text-gray-700 hover:bg-gray-50") : ""}
                >
                  {days} days
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className={`p-6 ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
                  <div className="animate-pulse">
                    <div className="w-12 h-12 rounded-xl bg-gray-200 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : analytics ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className={`p-6 ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#4DA3FF]/10 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-[#4DA3FF]" />
                      </div>
                    </div>
                    <p className={`text-3xl font-bold mb-1 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                      {formatNumber(analytics?.overview?.totalUploads || 0)}
                    </p>
                    <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Total Uploads
                    </p>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className={`p-6 ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
                        <Eye className="w-6 h-6 text-[#22C55E]" />
                      </div>
                    </div>
                    <p className={`text-3xl font-bold mb-1 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                      {formatNumber(analytics?.overview?.totalViews || 0)}
                    </p>
                    <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Total Views
                    </p>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className={`p-6 ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                        <Download className="w-6 h-6 text-[#D4AF37]" />
                      </div>
                    </div>
                    <p className={`text-3xl font-bold mb-1 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                      {formatNumber(analytics?.overview?.totalDownloads || 0)}
                    </p>
                    <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Total Downloads
                    </p>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className={`p-6 ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#A855F7]/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-[#A855F7]" />
                      </div>
                    </div>
                    <p className={`text-3xl font-bold mb-1 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                      {formatNumber(analytics?.overview?.totalStudentsReached || 0)}
                    </p>
                    <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Students Reached
                    </p>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className={`p-6 ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#F97316]/10 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-[#F97316]" />
                      </div>
                    </div>
                    <p className={`text-3xl font-bold mb-1 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                      {formatCurrency(analytics?.overview?.totalRevenue || 0)}
                    </p>
                    <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Premium Earnings
                    </p>
                  </Card>
                </motion.div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className={`p-6 ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
                    <h2 className={`text-xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                      Performance Over Time
                    </h2>
                    <div className="h-64">
                      {analytics?.chartData?.length > 0 ? (
                        <div className="flex items-end gap-2 h-full pb-8 border-b border-gray-200">
                          {analytics?.chartData?.map((data, index) => (
                            <div key={index} className="flex-1 flex flex-col gap-1">
                              <div className="flex gap-1 items-end flex-1">
                                <div
                                  className="flex-1 bg-[#22C55E] rounded-t transition-all hover:opacity-80"
                                  style={{ height: `${(data.views / maxValue) * 100}%` }}
                                  title={`${data.views} views`}
                                />
                                <div
                                  className="flex-1 bg-[#D4AF37] rounded-t transition-all hover:opacity-80"
                                  style={{ height: `${(data.downloads / maxValue) * 100}%` }}
                                  title={`${data.downloads} downloads`}
                                />
                              </div>
                              <span className={`text-xs text-center ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                {formatDate(data.date)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`flex items-center justify-center h-full ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          No data available
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#22C55E] rounded"></div>
                        <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Views</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#D4AF37] rounded"></div>
                        <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Downloads</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Most Viewed */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Card className={`p-6 ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
                    <h2 className={`text-xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                      Top Performing Resources
                    </h2>
                    <div className="space-y-4">
                      {analytics?.mostViewed?.length === 0 ? (
                        <p className={`text-center py-8 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          No resources yet
                        </p>
                      ) : (
                        analytics?.mostViewed?.map((resource, index) => (
                          <div
                            key={resource.id}
                            className={`flex items-center gap-4 p-3 rounded-lg ${
                              theme === "dark" ? "bg-[#0D1B2A]" : "bg-gray-50"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              index === 0 ? "bg-[#D4AF37] text-white" :
                              index === 1 ? "bg-gray-400 text-white" :
                              index === 2 ? "bg-amber-600 text-white" :
                              theme === "dark" ? "bg-white/10 text-white" : "bg-gray-200 text-gray-700"
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className={`font-semibold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                                {resource.title}
                              </h3>
                              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                {resource.type}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                                {formatNumber(resource.view_count)}
                              </p>
                              <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                views
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </motion.div>
              </div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8"
              >
                <Card className={`p-6 ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
                  <h2 className={`text-xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                    Recent Activity
                  </h2>
                  <div className="space-y-4">
                    {analytics?.recentActivity?.length === 0 ? (
                      <p className={`text-center py-8 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        No recent activity
                      </p>
                    ) : (
                      analytics?.recentActivity?.map((activity, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-4 p-3 rounded-lg ${
                            theme === "dark" ? "bg-[#0D1B2A]" : "bg-gray-50"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.action === 'view' ? 'bg-[#22C55E]/10' :
                            activity.action === 'download' ? 'bg-[#D4AF37]/10' :
                            'bg-[#4DA3FF]/10'
                          }`}>
                            {activity.action === 'view' ? <Eye className="w-5 h-5 text-[#22C55E]" /> :
                             activity.action === 'download' ? <Download className="w-5 h-5 text-[#D4AF37]" /> :
                             <TrendingUp className="w-5 h-5 text-[#4DA3FF]" />}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                              {activity.materials?.title || 'Unknown resource'}
                            </p>
                            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                              {activity.action} · {formatDate(activity.created_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </motion.div>
            </>
          ) : fetchError ? (
            <EmptyState title="Analytics unavailable" description={fetchError} />
          ) : (
            <EmptyState
              title="No analytics yet"
              description="Publish content to start tracking views and downloads."
            />
          )}
        </div>
    </TeacherDashboardLayout>
  );
}
