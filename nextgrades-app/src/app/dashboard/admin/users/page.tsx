"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Ban,
  CheckCircle,
  User,
  Mail,
  Calendar,
  Shield,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";

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

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter, verifiedFilter, sortBy]);

  const fetchUsers = async () => {
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
      toastError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      if (response.ok) {
        success(currentStatus ? "User suspended" : "User activated");
        fetchUsers();
      }
    } catch (error) {
      toastError("Failed to update user");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        success("User deleted successfully");
        fetchUsers();
      }
    } catch (error) {
      toastError("Failed to delete user");
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
    <div className={`flex min-h-screen ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]"}`}>
      <Sidebar role="admin" />
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 md:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                User Management
              </h1>
              <p className={`mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Manage user accounts and permissions
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
              Refresh
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
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
                  <option value="all">All Verification</option>
                  <option value="verified">Email Verified</option>
                  <option value="unverified">Unverified</option>
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
                  <option value="created_at">Newest First</option>
                  <option value="created_at_asc">Oldest First</option>
                  <option value="full_name">Name A–Z</option>
                  <option value="email">Email A–Z</option>
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
                        No users found
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
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={user.email_verified ? "bg-blue-500/10 text-blue-500" : "bg-amber-500/10 text-amber-600"}>
                            {user.email_verified ? "Verified" : "Unverified"}
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
                              <option value="student">Student</option>
                              <option value="teacher">Teacher</option>
                              <option value="admin">Admin</option>
                            </select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuspend(user.id, user.is_active)}
                              className={theme === "dark" ? "border-white/20 text-white hover:bg-white/10" : "border-gray-200 text-gray-700 hover:bg-gray-50"}
                            >
                              {user.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(user.id)}
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
  );
}
