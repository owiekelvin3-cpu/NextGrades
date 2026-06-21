"use client";

import { CheckCircle2 } from "lucide-react";

type CompareRow = {
  label: string;
  library?: string | boolean;
  group?: string | boolean;
  premium?: string | boolean;
  matura?: string | boolean;
};

type Props = {
  rows: CompareRow[];
  planColumns: string[];
  headers: Record<string, string | undefined>;
};

function CellValue({ value }: { value: string | boolean | undefined }) {
  if (value === true) {
    return <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" aria-hidden />;
  }
  if (value === false || value === undefined) {
    return <span className="text-gray-300">—</span>;
  }
  return <span className="text-sm text-gray-700">{value}</span>;
}

export function PricingCompareMobile({ rows, planColumns, headers }: Props) {
  return (
    <div className="space-y-3 md:hidden">
      {rows.map((row) => (
        <article
          key={row.label}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <h3 className="text-sm font-semibold leading-snug text-[#0D1B2A]">{row.label}</h3>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3">
            {planColumns.map((col) => (
              <div key={col} className="min-w-0">
                <dt className="truncate text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  {headers[col] ?? col}
                </dt>
                <dd className="mt-1 flex min-h-[1.25rem] items-center">
                  <CellValue value={row[col as keyof CompareRow] as string | boolean | undefined} />
                </dd>
              </div>
            ))}
          </dl>
        </article>
      ))}
    </div>
  );
}
