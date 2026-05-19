import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const missingSupabaseConfig = {
  message: "Supabase 环境变量未配置，请检查 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。",
};

const fallbackSupabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: missingSupabaseConfig }),
    onAuthStateChange: () => ({
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    }),
    signInWithOtp: async () => ({ data: null, error: missingSupabaseConfig }),
    verifyOtp: async () => ({ data: null, error: missingSupabaseConfig }),
    signOut: async () => ({ error: null }),
  },
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : fallbackSupabase;
