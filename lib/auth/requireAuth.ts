import { supabase } from "@/lib/supabase/client";

export async function requireAuthUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}
