"use client";

import { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
import { useToast } from "@/context/ToastContext";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { AdminCreateUserModal } from "@/components/admin/AdminCreateUserModal";
import {
  AdminTable,
  AdminTableActionsMenu,
  AdminTableStatusBadge,
  type AdminTableSortDirection,
} from "@/components/admin/AdminTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

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

import { themeInputClass, themeSelectCompactClass } from "@/lib/theme/form-fields";

const fieldClass = cn(themeInputClass, "rounded-lg py-2");
const selectClass = (value: string, extra?: string) => themeSelectCompactClass(value, cn("w-full pr-10", extra));

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl p-8 text-center text-text-muted">{/* loading */}</div>
      }
    >
      <AdminUsersPageContent />
    </Suspense>
  );
}

function AdminUsersPageContent() {
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
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${response.status}`);
      }
      const data = await response.json();
      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching users:", error);
      toastError(t("adminUsers.fetchFailed"));
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, statusFilter, verifiedFilter, sortBy, debouncedSearch, toastError, t]);

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

  const tableSort = useMemo(() => {
    if (sortBy === "created_at_asc") return { columnId: "joined", direction: "asc" as const };
    if (sortBy === "full_name") return { columnId: "user", direction: "asc" as const };
    if (sortBy === "email") return { columnId: "user", direction: "asc" as const };
    return { columnId: "joined", direction: "desc" as const };
  }, [sortBy]);

  const handleTableSort = (columnId: string, direction: AdminTableSortDirection) => {
    if (columnId === "user") {
      setSortBy("full_name");
      return;
    }
    if (columnId === "joined") {
      setSortBy(direction === "asc" ? "created_at_asc" : "created_at");
    }
  };

  const handleCreateSuccess = () => {
    success(t("adminUsers.createSuccess"));
    void fetchUsers();
  };

  const handleSuspend = async (userId: string, currentStatus: boolean) => {
    if (
      !confirm(
        currentStatus ? t("adminUsers.suspendConfirm") : t("adminUsers.reactivateConfirm")
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t("adminUsers.updateFailed"));
      success(currentStatus ? t("adminUsers.suspendSuccess") : t("adminUsers.reactivateSuccess"));
      void fetchUsers();
    } catch (error) {
      toastError(error instanceof Error ? error.message : t("adminUsers.updateFailed"));
    }
  };

  const handleDelete = async (userId: string, userName: string | null) => {
    if (!confirm(t("adminUsers.deleteConfirm", { name: userName || t("adminTable.noData") }))) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t("adminUsers.deleteFailed"));
      success(t("adminUsers.deleteSuccess"));
      void fetchUsers();
    } catch (error) {
      toastError(error instanceof Error ? error.message : t("adminUsers.deleteFailed"));
    }
  };

  const handleAddUnits = async (userId: string, userName: string | null) => {
    const raw = window.prompt(
      t("adminUsers.addUnitsPrompt", {
        defaultValue: "Wie viele Unterrichtsstunden gutschreiben? (z. B. 10)",
        name: userName || "",
      }),
      "10"
    );
    if (raw == null) return;
    const addUnits = Number.parseInt(raw, 10);
    if (!Number.isFinite(addUnits) || addUnits <= 0) {
      toastError(t("adminUsers.addUnitsInvalid", { defaultValue: "Bitte eine Zahl größer als 0 eingeben." }));
      return;
    }
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ add_units: addUnits }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || t("adminUsers.addUnitsFailed", { defaultValue: "Stunden konnten nicht gutgeschrieben werden." }));
      success(
        t("adminUsers.addUnitsSuccess", {
          defaultValue: "{{count}} Stunden gutgeschrieben. Noch {{remaining}} übrig.",
          count: addUnits,
          remaining: data.remaining_units ?? addUnits,
        })
      );
      void fetchUsers();
    } catch (error) {
      toastError(error instanceof Error ? error.message : t("adminUsers.addUnitsFailed", { defaultValue: "Stunden konnten nicht gutgeschrieben werden." }));
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
        void fetchUsers();
      } else {
        toastError(t("adminUsers.roleUpdateFailed"));
      }
    } catch {
      toastError(t("adminUsers.roleUpdateFailed"));
    }
  };

  const roleVariant = (role: string) => {
    if (role === "admin") return "warning" as const;
    if (role === "teacher") return "info" as const;
    if (role === "student") return "success" as const;
    return "default" as const;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("adminUsers.never");
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filtersToolbar = (
    <div className="flex w-full flex-col gap-3 lg:flex-row lg:flex-wrap">
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="search"
          placeholder={t("adminUsers.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(fieldClass, "pl-9")}
        />
      </div>
      {[
        {
          value: roleFilter,
          onChange: setRoleFilter,
          options: [
            ["all", t("adminUsers.allRoles")],
            ["admin", t("adminUsers.roleAdmin")],
            ["teacher", t("adminUsers.roleTeacher")],
            ["student", t("adminUsers.roleStudent")],
          ],
        },
        {
          value: statusFilter,
          onChange: setStatusFilter,
          options: [
            ["all", t("adminUsers.allStatus")],
            ["active", t("adminUsers.statusActive")],
            ["inactive", t("adminUsers.statusSuspended")],
          ],
        },
        {
          value: verifiedFilter,
          onChange: setVerifiedFilter,
          options: [
            ["all", t("adminUsers.allVerified")],
            ["verified", t("adminUsers.verified")],
            ["unverified", t("adminUsers.unverified")],
          ],
        },
        {
          value: sortBy,
          onChange: setSortBy,
          options: [
            ["created_at", t("adminUsers.sortNewest")],
            ["created_at_asc", t("adminUsers.sortOldest")],
            ["full_name", t("adminUsers.sortName")],
            ["email", "Email"],
          ],
        },
      ].map((filter, i) => (
        <div key={i} className="relative min-w-[140px]">
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className={selectClass(filter.value)}
          >
            {filter.options.map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdminPageHeader
        title={t("adminUsers.title")}
        description={t("adminUsers.description")}
        showBack={false}
        actions={
          <>
            <Button variant="gold" size="md" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("adminUsers.addUser")}
            </Button>
            <Button variant="outline" size="md" onClick={() => void fetchUsers()} disabled={loading}>
              <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
              {t("adminUsers.refresh")}
            </Button>
          </>
        }
      />

      <AdminCreateUserModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <Card hoverable={false} className="p-4">{filtersToolbar}</Card>

      <AdminTable
        columns={[
          {
            id: "user",
            header: t("adminTable.colUser"),
            sortable: true,
            sortValue: (row) => row.full_name ?? row.email ?? "",
            cell: (user) => (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-subtle">
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-text-muted" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{user.full_name || "-"}</p>
                  <p className="truncate text-sm text-text-muted">
                    {user.email || user.auth_user?.email}
                    {user.username ? ` · @${user.username}` : ""}
                  </p>
                </div>
              </div>
            ),
          },
          {
            id: "role",
            header: t("adminTable.colRole"),
            cell: (user) => (
              <AdminTableStatusBadge label={user.role} variant={roleVariant(user.role)} />
            ),
          },
          {
            id: "status",
            header: t("adminTable.colStatus"),
            cell: (user) => (
              <AdminTableStatusBadge
                label={user.is_active ? t("adminUsers.statusActive") : t("adminUsers.statusSuspended")}
                variant={user.is_active ? "success" : "warning"}
              />
            ),
          },
          {
            id: "verified",
            header: t("adminTable.colVerified"),
            cell: (user) => (
              <AdminTableStatusBadge
                label={user.email_verified ? t("adminUsers.verified") : t("adminUsers.unverified")}
                variant={user.email_verified ? "info" : "outline"}
              />
            ),
          },
          {
            id: "joined",
            header: t("adminTable.colJoined"),
            sortable: true,
            sortValue: (row) => row.created_at,
            cell: (user) => <span className="text-sm text-text-muted">{formatDate(user.created_at)}</span>,
          },
          {
            id: "lastLogin",
            header: t("adminTable.colLastLogin"),
            cell: (user) => (
              <span className="text-sm text-text-muted">
                {formatDate(user.last_login_at || user.auth_user?.last_sign_in_at || null)}
              </span>
            ),
          },
          {
            id: "actions",
            header: t("adminTable.colActions"),
            align: "right",
            cell: (user) => (
              <div className="flex items-center justify-end gap-2">
                <select
                  value={user.role}
                  onChange={(e) => void handleRoleChange(user.id, e.target.value)}
                  className={selectClass(user.role, "w-auto min-w-[6.5rem] py-1.5 text-xs")}
                  aria-label={t("adminUsers.createRole")}
                >
                  <option value="student">{t("adminUsers.roleStudent")}</option>
                  <option value="teacher">{t("adminUsers.roleTeacher")}</option>
                  <option value="admin">{t("adminUsers.roleAdmin")}</option>
                </select>
                <AdminTableActionsMenu
                  actions={[
                    ...(user.role === "student"
                      ? [
                          {
                            id: "units",
                            label: t("adminUsers.addUnits", { defaultValue: "Stunden gutschreiben" }),
                            icon: Plus,
                            onClick: () => void handleAddUnits(user.id, user.full_name),
                          },
                        ]
                      : []),
                    {
                      id: "suspend",
                      label: user.is_active ? t("adminUsers.suspendTitle") : t("adminUsers.reactivateTitle"),
                      icon: user.is_active ? Ban : CheckCircle,
                      onClick: () => void handleSuspend(user.id, user.is_active),
                    },
                    {
                      id: "delete",
                      label: t("adminUsers.deleteTitle"),
                      icon: Trash2,
                      variant: "danger" as const,
                      onClick: () => void handleDelete(user.id, user.full_name),
                    },
                  ]}
                />
              </div>
            ),
          },
        ]}
        data={users}
        loading={loading}
        sort={tableSort}
        onSortChange={handleTableSort}
        pagination={{ page, totalPages, onPageChange: setPage }}
        emptyState={{ title: t("adminUsers.noUsers") }}
      />
    </div>
  );
}
