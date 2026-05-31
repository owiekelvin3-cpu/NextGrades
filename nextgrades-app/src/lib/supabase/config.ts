import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

/** @deprecated Use getSupabaseUrl/getSupabaseAnonKey from ./env instead */
export const supabaseConfig = {
  get url() {
    return getSupabaseUrl();
  },
  get anonKey() {
    return getSupabaseAnonKey();
  },
};
