import { supabase } from "./supabase";

export async function ensureSession() {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session;

  const res = await supabase.auth.signInAnonymously();
  if (res.error) throw res.error;

  const { data: data2 } = await supabase.auth.getSession();
  if (!data2.session) throw new Error("No session after anonymous sign-in");
  return data2.session;
}
