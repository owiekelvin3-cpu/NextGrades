import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/** Load a translation key as a typed array/object; re-computes when language changes. */
export function useLocalizedContent<T>(key: string): T {
  const { t, i18n } = useTranslation();
  return useMemo(
    () => t(key, { returnObjects: true }) as T,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, t, i18n.language]
  );
}
