"use client";

import { useCallback, useEffect, useState } from "react";

export function useResendCooldown(initialSeconds = 60) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const startCooldown = useCallback(
    (duration = initialSeconds) => {
      setSecondsLeft(duration);
    },
    [initialSeconds]
  );

  const canResend = secondsLeft === 0;

  return { secondsLeft, canResend, startCooldown };
}
