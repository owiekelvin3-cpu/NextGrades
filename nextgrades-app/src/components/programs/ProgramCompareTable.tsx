"use client";

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
  includedLabel: string;
  excludedLabel: string;
  scrollHint?: string;
  className?: string;
};

const badgeBase =
  "mx-auto inline-flex min-w-[7rem] items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors";

function CompareStatusCell({
  value,
  partialLabel,
  includedLabel,
  excludedLabel,
}: {
  value: ProgramCompareCellValue;
  partialLabel: string;
  includedLabel: string;
  excludedLabel: string;
}) {
  if (value === true) {
    return (
      <span
        className={cn(
          badgeBase,
          "border-[var(--border-default)] bg-[var(--surface-subtle)] text-foreground"
        )}
        aria-label={includedLabel}
      >
        {includedLabel}
      </span>
    );
  }

  if (value === false) {
    return (
      <span
        className={cn(badgeBase, "border-[var(--border-subtle)] bg-transparent text-text-muted")}
        aria-label={excludedLabel}
      >
        {excludedLabel}
      </span>
    );
  }

  if (value === "partial") {
    return (
      <span
        className={cn(
          badgeBase,
          "border-[var(--brand-gold)] bg-transparent text-[var(--brand-gold)]"
        )}
        aria-label={partialLabel}
      >
        {partialLabel}
      </span>
    );
  }

  return <span className="text-sm font-medium text-foreground-secondary">{value}</span>;
}

/** Program comparison table - clean check / X / partial layout. */
export function ProgramCompareTable({
  title,
  headers,
  rows,
  partialLabel,
  includedLabel,
  excludedLabel,
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
                        includedLabel={includedLabel}
                        excludedLabel={excludedLabel}
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
