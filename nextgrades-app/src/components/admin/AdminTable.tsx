"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Inbox,
  List,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export type AdminTableSortDirection = "asc" | "desc";

export type AdminTableColumn<T> = {
  id: string;
  header: React.ReactNode;
  /** Enables sort UI on this column */
  sortable?: boolean;
  /** Client-side sort extractor (ignored when sort is controlled externally) */
  sortValue?: (row: T) => string | number | null | undefined;
  align?: "left" | "center" | "right";
  width?: string;
  className?: string;
  headerClassName?: string;
  cell: (row: T, index: number) => React.ReactNode;
};

export type AdminTablePagination = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
};

export type AdminTableEmptyState = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
};

export type AdminTableProps<T> = {
  columns: AdminTableColumn<T>[];
  data: T[];
  getRowId?: (row: T, index: number) => string;
  loading?: boolean;
  skeletonRows?: number;
  emptyState?: AdminTableEmptyState;
  pagination?: AdminTablePagination;
  /** Controlled sort — use with onSortChange for server-side sorting */
  sort?: { columnId: string; direction: AdminTableSortDirection } | null;
  onSortChange?: (columnId: string, direction: AdminTableSortDirection) => void;
  title?: React.ReactNode;
  toolbar?: React.ReactNode;
  className?: string;
  cardClassName?: string;
  stickyHeader?: boolean;
  dense?: boolean;
  wrapInCard?: boolean;
};

export type AdminTableAction = {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
};

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

function compareSortValues(a: string | number | null | undefined, b: string | number | null | undefined) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { sensitivity: "base" });
}

function AdminTableSkeleton({ columns, rows, dense }: { columns: number; rows: number; dense?: boolean }) {
  const cellPad = dense ? "px-3 py-2.5" : "px-4 py-3.5";
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-[var(--table-border)]">
          {Array.from({ length: columns }).map((__, colIndex) => (
            <td key={colIndex} className={cellPad}>
              <Skeleton className={cn("h-4 rounded-md", colIndex === 0 ? "w-3/5 max-w-[220px]" : "w-24")} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function AdminTableEmpty({ state }: { state: AdminTableEmptyState }) {
  const Icon = state.icon ?? Inbox;
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-gold-muted)]">
        <Icon className="h-7 w-7 text-[var(--brand-gold)]" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-foreground">{state.title}</h3>
      {state.description ? (
        <p className="mt-2 max-w-md text-sm text-text-muted">{state.description}</p>
      ) : null}
      {state.action ? <div className="mt-5">{state.action}</div> : null}
    </div>
  );
}

/** Three-dot row action menu for AdminTable action columns */
export function AdminTableActionsMenu({
  actions,
  align = "right",
  "aria-label": ariaLabel,
}: {
  actions: AdminTableAction[];
  align?: "left" | "right";
  "aria-label"?: string;
}) {
  const { t } = useTranslation();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  if (!actions.length) return null;

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default text-text-muted transition-colors hover:border-[var(--brand-gold)]/40 hover:bg-[var(--table-row-hover)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold-ring)]"
        aria-label={ariaLabel ?? t("adminTable.actionsMenu")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className={cn(
            "absolute z-30 mt-1 min-w-[11rem] overflow-hidden rounded-xl border border-border-default bg-surface-elevated py-1 shadow-[var(--card-shadow)]",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                role="menuitem"
                disabled={action.disabled}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                  action.variant === "danger"
                    ? "text-[var(--alert-error-fg)] hover:bg-[var(--alert-error-bg)]"
                    : "text-foreground hover:bg-[var(--table-row-hover)]"
                )}
                onClick={() => {
                  setOpen(false);
                  action.onClick();
                }}
              >
                {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden /> : null}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/** Status badge helper for table cells */
export function AdminTableStatusBadge({
  label,
  variant = "default",
  className,
}: {
  label: React.ReactNode;
  variant?: React.ComponentProps<typeof Badge>["variant"];
  className?: string;
}) {
  return (
    <Badge variant={variant} className={cn("text-xs font-medium", className)}>
      {label}
    </Badge>
  );
}

export function AdminTable<T>({
  columns,
  data,
  getRowId = (row, index) => {
    const candidate = (row as { id?: string }).id;
    return candidate ?? String(index);
  },
  loading = false,
  skeletonRows = 6,
  emptyState,
  pagination,
  sort: controlledSort,
  onSortChange,
  title,
  toolbar,
  className,
  cardClassName,
  stickyHeader = true,
  dense = false,
  wrapInCard = true,
}: AdminTableProps<T>) {
  const { t } = useTranslation();
  const [internalSort, setInternalSort] = useState<{
    columnId: string;
    direction: AdminTableSortDirection;
  } | null>(null);

  const isControlled = Boolean(onSortChange);
  const activeSort = isControlled ? controlledSort ?? null : internalSort;

  const handleSort = (column: AdminTableColumn<T>) => {
    if (!column.sortable) return;

    const nextDirection: AdminTableSortDirection =
      activeSort?.columnId === column.id
        ? activeSort.direction === "asc"
          ? "desc"
          : "asc"
        : "asc";

    if (isControlled) {
      onSortChange?.(column.id, nextDirection);
      return;
    }

    setInternalSort({ columnId: column.id, direction: nextDirection });
  };

  const displayData = useMemo(() => {
    if (isControlled || !activeSort) return data;

    const column = columns.find((col) => col.id === activeSort.columnId);
    if (!column?.sortValue) return data;

    const sorted = [...data].sort((a, b) => {
      const result = compareSortValues(column.sortValue!(a), column.sortValue!(b));
      return activeSort.direction === "asc" ? result : -result;
    });
    return sorted;
  }, [activeSort, columns, data, isControlled]);

  const cellPad = dense ? "px-3 py-2.5" : "px-4 py-3.5";
  const headPad = dense ? "px-3 py-2.5" : "px-4 py-3";

  const tableBody = (
    <div className={cn("theme-table-wrap", className)}>
      {(title || toolbar) && (
        <div className="flex flex-col gap-3 border-b border-[var(--table-border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          {title ? <div className="text-sm font-semibold text-foreground">{title}</div> : <span />}
          {toolbar ? <div className="flex flex-wrap items-center gap-2">{toolbar}</div> : null}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead className={cn("theme-table-head", stickyHeader && "sticky top-0 z-10")}>
            <tr>
              {columns.map((column) => {
                const isActive = activeSort?.columnId === column.id;
                const SortIcon = !column.sortable
                  ? null
                  : isActive
                    ? activeSort!.direction === "asc"
                      ? ChevronUp
                      : ChevronDown
                    : List;

                return (
                  <th
                    key={column.id}
                    scope="col"
                    style={column.width ? { width: column.width } : undefined}
                    className={cn(
                      headPad,
                      "text-xs font-semibold uppercase tracking-wide text-text-muted",
                      alignClass[column.align ?? "left"],
                      column.headerClassName
                    )}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(column)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold-ring)]",
                          isActive && "text-[var(--brand-gold)]"
                        )}
                        aria-label={t("adminTable.sortBy", { column: String(column.header) })}
                      >
                        <span>{column.header}</span>
                        {SortIcon ? (
                          <SortIcon
                            className={cn("h-3.5 w-3.5 shrink-0", !isActive && "opacity-40")}
                            aria-hidden
                          />
                        ) : null}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <AdminTableSkeleton columns={columns.length} rows={skeletonRows} dense={dense} />
            ) : displayData.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <AdminTableEmpty
                    state={
                      emptyState ?? {
                        title: t("adminTable.noData"),
                        description: t("adminTable.noDataDesc"),
                      }
                    }
                  />
                </td>
              </tr>
            ) : (
              displayData.map((row, index) => (
                <tr
                  key={getRowId(row, index)}
                  className="theme-table-row border-b border-[var(--table-border)] transition-colors last:border-b-0"
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        cellPad,
                        "align-middle text-foreground",
                        alignClass[column.align ?? "left"],
                        column.className
                      )}
                    >
                      {column.cell(row, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex flex-col gap-3 border-t border-[var(--table-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-muted">
            {t("adminTable.pageOf", {
              page: pagination.page,
              total: pagination.totalPages,
            })}
            {typeof pagination.totalItems === "number"
              ? ` · ${t("adminTable.totalItems", { count: pagination.totalItems })}`
              : null}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(Math.max(1, pagination.page - 1))}
            >
              {t("adminTable.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                pagination.onPageChange(Math.min(pagination.totalPages, pagination.page + 1))
              }
            >
              {t("adminTable.next")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );

  if (!wrapInCard) return tableBody;

  return <Card className={cn("overflow-hidden p-0", cardClassName)}>{tableBody}</Card>;
}
