import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let supabase: any = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== "your-supabase-url" && supabaseAnonKey !== "your-supabase-anon-key" && supabaseUrl.startsWith("http")) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  supabase = {
    auth: {
      signInWithPassword: async () => ({ error: new Error("Supabase credentials are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.") }),
      signUp: async () => ({ error: new Error("Supabase credentials are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.") }),
    },
  };
}

export { supabase };
