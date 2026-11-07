import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

/**
 * Анонимный клиент без cookies — для публичных данных (меню, отзывы).
 * Подчиняется RLS как обычный посетитель. Подходит для кэшируемых функций.
 */
export function createPublicClient() {
  if (!isSupabaseConfigured) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    // Кэшированием управляют функции с "use cache" и теги (сбрасываются из админки).
    // Отключаем кэш отдельных запросов, чтобы не получить устаревшие данные со сборки.
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}
