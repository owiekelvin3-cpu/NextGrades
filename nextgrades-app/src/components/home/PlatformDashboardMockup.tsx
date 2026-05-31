"use client";

/** Laptop mockup matching the NextGrades homepage UI design */
export function PlatformDashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="rounded-t-xl bg-[#1a1a1a] px-4 pt-3 pb-2 shadow-2xl">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
      </div>
      <div className="overflow-hidden rounded-b-xl border border-[#1a1a1a] bg-white shadow-2xl">
        <div className="flex min-h-[280px]">
          <aside className="w-[72px] shrink-0 border-r border-gray-100 bg-[#0D1B2A] p-2">
            <div className="mb-3 h-6 w-6 rounded bg-[#D4AF37]/30" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="mb-2 h-5 w-full rounded bg-white/10" />
            ))}
          </aside>
          <div className="flex-1 p-3 text-[10px] sm:text-xs">
            <p className="mb-2 font-bold text-[#0D1B2A]">Mein Fortschritt</p>
            <div className="mb-3 grid grid-cols-3 gap-2">
              {[
                { label: "Physik", pct: 74, color: "#3B82F6" },
                { label: "Englisch", pct: 91, color: "#22C55E" },
                { label: "Deutsch", pct: 82, color: "#D4AF37" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-gray-100 p-2 text-center">
                  <div
                    className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full text-[9px] font-bold text-[#0D1B2A]"
                    style={{
                      background: `conic-gradient(${s.color} ${s.pct * 3.6}deg, #e5e7eb 0)`,
                    }}
                  >
                    {s.pct}%
                  </div>
                  <span className="text-[9px] text-gray-600">{s.label}</span>
                </div>
              ))}
            </div>
            <p className="mb-1 font-semibold text-[#0D1B2A]">Lernfortschritt</p>
            <div className="flex h-16 items-end gap-1 rounded-lg bg-gray-50 p-2">
              {[40, 55, 48, 62, 58, 70, 65, 78, 72, 85].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-[#D4AF37] to-[#F5A623]"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto h-3 w-[85%] rounded-b-lg bg-[#2a2a2a]" />
    </div>
  );
}
