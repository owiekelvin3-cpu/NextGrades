/** Convert wall-clock date/time in an IANA timezone to a UTC Date for DB storage. */
export function wallTimeToUtc(date: string, time: string, timeZone: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const target = { year, month, day, hour, minute };

  let guess = Date.UTC(year, month - 1, day, hour, minute, 0);

  for (let i = 0; i < 6; i++) {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour12: false,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
        .formatToParts(new Date(guess))
        .map((p) => [p.type, p.value])
    );

    const got = {
      year: Number(parts.year),
      month: Number(parts.month),
      day: Number(parts.day),
      hour: Number(parts.hour),
      minute: Number(parts.minute),
    };

    const targetMs = Date.UTC(target.year, target.month - 1, target.day, target.hour, target.minute);
    const gotMs = Date.UTC(got.year, got.month - 1, got.day, got.hour, got.minute);
    const diffMs = targetMs - gotMs;

    if (diffMs === 0) break;
    guess += diffMs;
  }

  return new Date(guess);
}

export function formatZoomLocalStartTime(date: string, time: string): string {
  return `${date}T${time}:00`;
}

/** Calendar date in the user's local timezone (never UTC via toISOString). */
export function formatLocalYmd(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
