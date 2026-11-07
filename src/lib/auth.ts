import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createSessionClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Проверяет, что текущий пользователь — администратор.
 * Используется во всех страницах и server actions админки.
 * Дополнительно все операции защищены RLS в базе данных.
 */
export async function requireAdmin() {
  // Проверка прав — всегда в момент запроса, никогда при предварительном рендере.
  await connection();
  if (!isSupabaseConfigured) redirect("/admin/login?error=config");
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/admin/login");

  const { data: profile } = await supabase.from("profiles").select("role, email").eq("id", userId).maybeSingle();
  if (profile?.role !== "admin") redirect("/admin/login?error=forbidden");

  return { supabase, userId, email: (profile.email as string | null) ?? (data.claims.email as string | undefined) ?? "" };
}
