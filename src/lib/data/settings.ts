import { cacheLife, cacheTag } from "next/cache";
import { siteDefaults } from "@/config/site";
import { createPublicClient } from "@/lib/supabase/public";
import type { StoreSettings } from "@/types";
import { CACHE_TAGS } from "./tags";

export function mapSettings(row: Record<string, unknown> | null): StoreSettings {
  if (!row) return { ...siteDefaults };
  return {
    name: String(row.name),
    phone: String(row.phone),
    address: String(row.address),
    addressNote: (row.address_note as string | null) ?? null,
    postalCode: (row.postal_code as string | null) ?? null,
    hoursText: String(row.hours_text),
    openTime: String(row.open_time).slice(0, 5),
    closeTime: String(row.close_time).slice(0, 5),
    orderingEnabled: Boolean(row.ordering_enabled),
    combosEnabled: Boolean(row.combos_enabled),
  };
}

export async function getStoreSettings(): Promise<StoreSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.settings);

  const supabase = createPublicClient();
  if (!supabase) return { ...siteDefaults };
  const { data, error } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
  if (error) {
    console.error("[settings]", error.message);
    return { ...siteDefaults };
  }
  return mapSettings(data);
}
