"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  Plus,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { AdminCreateUserModal } from "@/components/admin/AdminCreateUserModal";

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
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl p-8 text-center text-gray-500">Loading…</div>
      }
    >
      <AdminUsersPageContent />
    </Suspense>
  );
}

function AdminUsersPageContent() {
  const { theme } = useTheme();
  const { success, error: toastError } = useToast();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
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
        search: debouncedSearch,
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
      toastError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, statusFilter, verifiedFilter, sortBy, debouncedSearch, toastError]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setCreateOpen(true);
      router.replace("/portal/admin/users", { scroll: false });
    }
  }, [searchParams, router]);

  const handleCreateSuccess = () => {
    success(t("adminUsers.createSuccess"));
    void fetchUsers();
  };

  const handleSuspend = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? "suspend" : "reactivate";
    if (!confirm(currentStatus ? "Suspend this user? They will be signed out and unable to log in." : "Reactivate this user? They will be able to log in again.")) {
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
      success(currentStatus ? "User suspended — they can no longer sign in" : "User reactivated");
      fetchUsers();
    } catch (error) {
      toastError(error instanceof Error ? error.message : "Failed to update user");
    }
  };

  const handleDelete = async (userId: string, userName: string | null) => {
    if (
      !confirm(
        `Permanently delete ${userName || "this user"}?\n\nThis removes their account, profile, and all associated data. This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete user");
      success("User permanently deleted");
      fetchUsers();
    } catch (error) {
      toastError(error instanceof Error ? error.message : "Failed to delete user");
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
        success("User role updated");
        fetchUsers();
      }
    } catch (error) {
      toastError("Failed to update user role");
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
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold text-foreground`}>
                User Management
              </h1>
              <p className={`mt-1 text-text-muted`}>
                Manage user accounts and permissions
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="gold" size="md" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("adminUsers.addUser")}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={fetchUsers}
                disabled={loading}
                className={theme === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-gray-200 text-gray-700 hover:bg-gray-50"}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          <AdminCreateUserModal
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onSuccess={handleCreateSuccess}
          />

          {/* Filters */}
          <Card className={`p-4 mb-6`}>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted`} />
                <input
                  type="text"
                  placeholder="Search users..."
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
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
                <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none text-text-muted`} />
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
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Suspended</option>
                </select>
                <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none text-text-muted`} />
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
                  <option value="all">All Verification</option>
                  <option value="verified">Email Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
                <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none text-text-muted`} />
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
                  <option value="created_at">Newest First</option>
                  <option value="created_at_asc">Oldest First</option>
                  <option value="full_name">Name A–Z</option>
                  <option value="email">Email A–Z</option>
                </select>
                <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none text-text-muted`} />
              </div>
            </div>
          </Card>

          {/* Users Table */}
          <Card className={`overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b border-border-default`}>
                    <th className={`text-left p-4 text-sm font-semibold text-text-muted`}>
                      User
                    </th>
                    <th className={`text-left p-4 text-sm font-semibold text-text-muted`}>
                      Role
                    </th>
                    <th className={`text-left p-4 text-sm font-semibold text-text-muted`}>
                      Status
                    </th>
                    <th className={`text-left p-4 text-sm font-semibold text-text-muted`}>
                      Verified
                    </th>
                    <th className={`text-left p-4 text-sm font-semibold text-text-muted`}>
                      Joined
                    </th>
                    <th className={`text-left p-4 text-sm font-semibold text-text-muted`}>
                      Last Login
                    </th>
                    <th className={`text-right p-4 text-sm font-semibold text-text-muted`}>
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
                      <td colSpan={7} className={`p-12 text-center text-text-muted`}>
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
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
                                <User className={`w-5 h-5 text-text-muted`} />
                              )}
                            </div>
                            <div>
                              <p className={`font-medium text-foreground`}>
                                {user.full_name || "Unknown"}
                              </p>
                              <p className={`text-sm text-text-muted`}>
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
                            {user.is_active ? "Active" : "Suspended"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={user.email_verified ? "bg-blue-500/10 text-blue-500" : "bg-amber-500/10 text-amber-600"}>
                            {user.email_verified ? "Verified" : "Unverified"}
                          </Badge>
                        </td>
                        <td className={`p-4 text-sm text-text-muted`}>
                          {formatDate(user.created_at)}
                        </td>
                        <td className={`p-4 text-sm text-text-muted`}>
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
                              <option value="student">Student</option>
                              <option value="teacher">Teacher</option>
                              <option value="admin">Admin</option>
                            </select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuspend(user.id, user.is_active)}
                              title={user.is_active ? "Suspend user" : "Reactivate user"}
                              className={theme === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-gray-200 text-gray-700 hover:bg-gray-50"}
                            >
                              {user.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(user.id, user.full_name)}
                              title="Permanently delete user"
                              className={`text-red-500 hover:bg-red-500/10 ${theme === "dark" ? "border-white/20" : "border-gray-200"}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200">
                <p className={`text-sm text-text-muted`}>
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
  );
}
