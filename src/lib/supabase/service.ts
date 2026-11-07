import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

/**
 * Серверный клиент с ключом service_role. Обходит RLS — использовать
 * ТОЛЬКО в серверном коде (route handlers / server actions) для операций,
 * которые нельзя доверить браузеру: создание заказа, отзывы, антиспам.
 */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !key) return null;
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
