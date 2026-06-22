"use client";

import { useEffect, useRef, useState } from "react";

export function useAutoSave<T>(
  value: T,
  saveFn: (val: T) => Promise<void>,
  delay = 2000
): { status: "idle" | "saving" | "saved" | "error" } {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const lastSaved = useRef<string>("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const serialized = JSON.stringify(value);
    if (serialized === lastSaved.current) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setStatus("saving");
      void saveFn(value)
        .then(() => {
          lastSaved.current = serialized;
          setStatus("saved");
          setTimeout(() => setStatus("idle"), 2000);
        })
        .catch(() => setStatus("error"));
    }, delay);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, saveFn, delay]);

  return { status };
}
