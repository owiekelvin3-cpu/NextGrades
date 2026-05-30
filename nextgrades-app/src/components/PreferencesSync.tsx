"use client";

import { useEffect } from "react";
import { supabase, isSupabaseEnvConfigured } from "@/lib/supabase/client";
import { syncPreferencesAfterAuth } from "@/lib/preferences";
import { changeAppLanguage } from "@/components/I18nProvider";

/** Keeps theme + language in sync with the database for authenticated users. */
export function PreferencesSync() {
  useEffect(() => {
    if (!isSupabaseEnvConfigured()) return;

    const sync = () => syncPreferencesAfterAuth((lang) => changeAppLanguage(lang));

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) void sync();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        void sync();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
