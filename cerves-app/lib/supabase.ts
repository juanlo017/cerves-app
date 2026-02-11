import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // On web, let Supabase detect the session from URL after OAuth redirect
    // On mobile, we handle deep links manually in AuthContext
    detectSessionInUrl: Platform.OS === 'web',
  },
});
