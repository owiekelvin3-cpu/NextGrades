"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileTopBar } from "@/components/mobile/MobileTopBar";
import { MobileBottomNav, MOBILE_BOTTOM_NAV_PADDING } from "@/components/mobile/MobileBottomNav";
import { appShell } from "@/lib/theme/shell";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  Trash2,
  Ban,
  CheckCircle,
  User,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@/lib/i18n/locales";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  username: string | null;
  role: string;
  avatar_url: string | null;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  last_login_at: string | null;
  auth_user: {
    email: string;
    created_at: string;
    last_sign_in_at: string | null;
  } | null;
}

export default function AdminUsersPage() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { success, error: toastError } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search: searchQuery,
        role: roleFilter,
        status: statusFilter,
        verified: verifiedFilter,
        sort: sortBy,
      });
      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching users:", error);
      toastError(t("adminUsers.fetchFailed"));
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, statusFilter, verifiedFilter, sortBy, searchQuery, toastError]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleSuspend = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? "suspend" : "reactivate";
    if (!confirm(currentStatus ? t("adminUsers.suspendConfirm") : t("adminUsers.reactivateConfirm"))) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Failed to ${action} user`);
      success(currentStatus ? t("adminUsers.suspendSuccess") : t("adminUsers.reactivateSuccess"));
      fetchUsers();
    } catch (error) {
      toastError(error instanceof Error ? error.message : t("adminUsers.updateFailed"));
    }
  };

  const handleDelete = async (userId: string, userName: string | null) => {
    if (!confirm(t("adminUsers.deleteConfirm", { name: userName || t("adminUsers.deleteTitle") }))) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete user");
      success(t("adminUsers.deleteSuccess"));
      fetchUsers();
    } catch (error) {
      toastError(error instanceof Error ? error.message : t("adminUsers.deleteFailed"));
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (response.ok) {
        success(t("adminUsers.roleUpdated"));
        fetchUsers();
      }
    } catch (error) {
      toastError(t("adminUsers.roleUpdateFailed"));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-500/10 text-purple-500";
      case "teacher": return "bg-blue-500/10 text-blue-500";
      case "student": return "bg-green-500/10 text-green-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("adminUsers.never");
    return new Date(dateString).toLocaleDateString(getDateLocale(i18n.language), {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className={cn(appShell.dashboardShell, theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]")}>
      <Sidebar role="admin" />

      <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden", MOBILE_BOTTOM_NAV_PADDING)}>
        <MobileTopBar role="admin" />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 md:hidden">
            <h1 className={appShell.dashboardTitle}>{t("adminUsers.title")}</h1>
            <p className={appShell.dashboardDescription}>{t("adminUsers.description")}</p>
          </div>

          {/* Header */}
          <div className="mb-8 hidden flex-col items-start justify-between gap-4 md:flex md:flex-row md:items-center">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                {t("adminUsers.title")}
              </h1>
              <p className={`mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {t("adminUsers.description")}
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={fetchUsers}
              disabled={loading}
              className={theme === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-gray-200 text-gray-700 hover:bg-gray-50"}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {t("adminUsers.refresh")}
            </Button>
          </div>

          {/* Filters */}
          <Card className={`p-4 mb-6 ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                <input
                  type="text"
                  placeholder={t("adminUsers.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === "dark"
                      ? "bg-[#0D1B2A] border-white/10 text-white placeholder-gray-500"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                  } focus:outline-none focus:ring-2 focus:ring-[#D4AF37]`}
                />
              </div>

              {/* Role Filter */}
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className={`appearance-none px-4 py-2 pr-10 rounded-lg border ${
                    theme === "dark"
                      ? "bg-[#0D1B2A] border-white/10 text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-[#D4AF37]`}
                >
                  <option value="all">{t("adminUsers.allRoles")}</option>
                  <option value="admin">{t("adminUsers.roleAdmin")}</option>
                  <option value="teacher">{t("adminUsers.roleTeacher")}</option>
                  <option value="student">{t("adminUsers.roleStudent")}</option>
                </select>
                <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`appearance-none px-4 py-2 pr-10 rounded-lg border ${
                    theme === "dark"
                      ? "bg-[#0D1B2A] border-white/10 text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-[#D4AF37]`}
                >
                  <option value="all">{t("adminUsers.allStatus")}</option>
                  <option value="active">{t("adminUsers.statusActive")}</option>
                  <option value="inactive">{t("adminUsers.statusSuspended")}</option>
                </select>
                <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
              </div>

              {/* Verification Filter */}
              <div className="relative">
                <select
                  value={verifiedFilter}
                  onChange={(e) => setVerifiedFilter(e.target.value)}
                  className={`appearance-none px-4 py-2 pr-10 rounded-lg border ${
                    theme === "dark"
                      ? "bg-[#0D1B2A] border-white/10 text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-[#D4AF37]`}
                >
                  <option value="all">{t("adminUsers.allVerified")}</option>
                  <option value="verified">{t("adminUsers.verified")}</option>
                  <option value="unverified">{t("adminUsers.unverified")}</option>
                </select>
                <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`appearance-none px-4 py-2 pr-10 rounded-lg border ${
                    theme === "dark"
                      ? "bg-[#0D1B2A] border-white/10 text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-[#D4AF37]`}
                >
                  <option value="created_at">{t("adminUsers.sortNewest")}</option>
                  <option value="created_at_asc">{t("adminUsers.sortOldest")}</option>
                  <option value="full_name">{t("adminUsers.sortName")}</option>
                  <option value="email">{t("login.email")}</option>
                </select>
                <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
              </div>
            </div>
          </Card>

          {/* Users Table */}
          <Card className={`overflow-hidden ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
                    <th className={`text-left p-4 text-sm font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      User
                    </th>
                    <th className={`text-left p-4 text-sm font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Role
                    </th>
                    <th className={`text-left p-4 text-sm font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Status
                    </th>
                    <th className={`text-left p-4 text-sm font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Verified
                    </th>
                    <th className={`text-left p-4 text-sm font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Joined
                    </th>
                    <th className={`text-left p-4 text-sm font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Last Login
                    </th>
                    <th className={`text-right p-4 text-sm font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="p-4">
                          <div className="h-10 bg-gray-200 rounded"></div>
                        </td>
                        <td className="p-4">
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                        </td>
                        <td className="p-4">
                          <div className="h-6 bg-gray-200 rounded w-16"></div>
                        </td>
                        <td className="p-4">
                          <div className="h-6 bg-gray-200 rounded w-24"></div>
                        </td>
                        <td className="p-4">
                          <div className="h-6 bg-gray-200 rounded w-24"></div>
                        </td>
                        <td className="p-4">
                          <div className="h-8 bg-gray-200 rounded w-20 ml-auto"></div>
                        </td>
                      </tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={`p-12 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        {t("adminUsers.noUsers")}
                      </td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className={`border-b ${theme === "dark" ? "border-white/5 hover:bg-white/5" : "border-gray-100 hover:bg-gray-50"}`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-gray-100"}`}>
                              {user.avatar_url ? (
                                <img
                                  src={user.avatar_url}
                                  alt={user.full_name || "User"}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <User className={`w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                              )}
                            </div>
                            <div>
                              <p className={`font-medium ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                                {user.full_name || "Unknown"}
                              </p>
                              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                                {user.email || user.auth_user?.email}
                                {user.username ? ` · @${user.username}` : ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={user.is_active ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}>
                            {user.is_active ? t("adminUsers.statusActive") : t("adminUsers.statusSuspended")}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={user.email_verified ? "bg-blue-500/10 text-blue-500" : "bg-amber-500/10 text-amber-600"}>
                            {user.email_verified ? t("adminUsers.verified") : t("adminUsers.unverified")}
                          </Badge>
                        </td>
                        <td className={`p-4 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          {formatDate(user.created_at)}
                        </td>
                        <td className={`p-4 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          {formatDate(user.last_login_at || user.auth_user?.last_sign_in_at || null)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className={`text-xs px-2 py-1 rounded border ${
                                theme === "dark"
                                  ? "bg-[#0D1B2A] border-white/10 text-white"
                                  : "bg-white border-gray-200 text-gray-900"
                              }`}
                            >
                              <option value="student">{t("adminUsers.roleStudent")}</option>
                              <option value="teacher">{t("adminUsers.roleTeacher")}</option>
                              <option value="admin">{t("adminUsers.roleAdmin")}</option>
                            </select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuspend(user.id, user.is_active)}
                              title={user.is_active ? t("adminUsers.suspendTitle") : t("adminUsers.reactivateTitle")}
                              className={theme === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-gray-200 text-gray-700 hover:bg-gray-50"}
                            >
                              {user.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(user.id, user.full_name)}
                              title={t("adminUsers.deleteTitle")}
                              className={`text-red-500 hover:bg-red-500/10 ${theme === "dark" ? "border-white/20" : "border-gray-200"}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200">
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className={theme === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-gray-200 text-gray-700 hover:bg-gray-50"}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className={theme === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-gray-200 text-gray-700 hover:bg-gray-50"}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
        </main>
      </div>
      <MobileBottomNav role="admin" />
    </div>
  );
}
