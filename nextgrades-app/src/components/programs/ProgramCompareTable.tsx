"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProgramCompareCellValue = boolean | "partial" | string;

export type ProgramCompareRow = {
  label: string;
  c1: ProgramCompareCellValue;
  c2: ProgramCompareCellValue;
  c3: ProgramCompareCellValue;
  c4?: ProgramCompareCellValue;
};

export type ProgramCompareHeaders = {
  features: string;
  oneOnOne: string;
  group: string;
  library: string;
  math: string;
};

type Props = {
  title: string;
  headers: ProgramCompareHeaders;
  rows: ProgramCompareRow[];
  partialLabel: string;
  scrollHint?: string;
  className?: string;
};

const statusIconBase =
  "mx-auto flex h-8 w-8 items-center justify-center rounded-full border transition-colors";

function CompareStatusCell({
  value,
  partialLabel,
}: {
  value: ProgramCompareCellValue;
  partialLabel: string;
}) {
  if (value === true) {
    return (
      <span
        className={cn(
          statusIconBase,
          "border-[var(--alert-success-border)] bg-[var(--alert-success-bg)] text-[var(--alert-success-fg)]"
        )}
        aria-label="Included"
      >
        <Check className="h-3.5 w-3.5 stroke-[2.75]" aria-hidden />
      </span>
    );
  }

  if (value === false) {
    return (
      <span
        className={cn(
          statusIconBase,
          "border-[var(--border-subtle)] bg-[var(--surface-inset)] text-[var(--text-subtle)]"
        )}
        aria-label="Not included"
      >
        <X className="h-3.5 w-3.5 stroke-[2.25]" aria-hidden />
      </span>
    );
  }

  if (value === "partial") {
    return (
      <span
        className="mx-auto inline-flex max-w-[9.5rem] items-center justify-center gap-1.5 rounded-full border border-[var(--alert-warning-border)] bg-[var(--alert-warning-bg)] px-2.5 py-1 text-xs font-medium text-[var(--alert-warning-fg)]"
        aria-label={partialLabel}
      >
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-gold)]" aria-hidden />
        {partialLabel}
      </span>
    );
  }

  return <span className="text-sm font-medium text-foreground-secondary">{value}</span>;
}

/** Program comparison table — clean check / X / partial layout. */
export function ProgramCompareTable({
  title,
  headers,
  rows,
  partialLabel,
  scrollHint,
  className,
}: Props) {
  const columns: (keyof Pick<ProgramCompareRow, "c1" | "c2" | "c3" | "c4">)[] = [
    "c1",
    "c2",
    "c3",
    "c4",
  ];
  const headerLabels = [headers.oneOnOne, headers.group, headers.library, headers.math];

  return (
    <section className={cn("py-14 md:py-16", className)}>
      <div className="site-container mx-auto w-full min-w-0 max-w-7xl px-5 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-center text-2xl font-bold text-foreground md:mb-8 md:text-3xl">{title}</h2>

        {scrollHint ? (
          <p className="mb-3 text-center text-xs text-text-muted md:hidden">{scrollHint}</p>
        ) : null}

        <div className="overflow-x-auto rounded-2xl border border-[var(--table-border)] bg-surface-elevated shadow-[var(--card-shadow)]">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--table-border)] bg-[var(--table-header)]">
                <th className="px-4 py-4 text-left text-sm font-semibold text-foreground sm:px-6 sm:py-5">
                  {headers.features}
                </th>
                {headerLabels.map((label) => (
                  <th
                    key={label}
                    className="px-3 py-4 text-center text-xs font-semibold leading-snug text-foreground sm:px-4 sm:py-5 sm:text-sm"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.label}
                  className={cn(
                    "border-b border-[var(--table-border)] last:border-b-0 transition-colors hover:bg-[var(--table-row-hover)]",
                    index % 2 === 0 ? "bg-surface-elevated" : "bg-surface-muted/50"
                  )}
                >
                  <td className="px-4 py-4 text-sm font-medium text-foreground-secondary sm:px-6 sm:py-4">
                    {row.label}
                  </td>
                  {columns.map((col) => (
                    <td key={col} className="px-3 py-3.5 text-center sm:px-4 sm:py-4">
                      <CompareStatusCell
                        value={row[col] ?? false}
                        partialLabel={partialLabel}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
