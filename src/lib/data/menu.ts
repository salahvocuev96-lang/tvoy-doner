import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { MenuCategory, Product } from "@/types";
import { CACHE_TAGS } from "./tags";

export interface MenuData {
  categories: MenuCategory[];
  error: boolean;
}

const bySort = (a: { sort_order: number; name: string }, b: { sort_order: number; name: string }) =>
  a.sort_order - b.sort_order || a.name.localeCompare(b.name, "ru");

/** Публичное меню: только активные категории и товары (RLS + фильтр). */
export async function getMenu(combosEnabled: boolean): Promise<MenuData> {
  "use cache";
  cacheLife("seconds");
  cacheTag(CACHE_TAGS.menu, CACHE_TAGS.settings);

  const supabase = createPublicClient();
  if (!supabase) return { categories: [], error: true };

  const [cats, prods] = await Promise.all([
    supabase.from("categories").select("id, slug, name, sort_order, is_active").eq("is_active", true),
    supabase
      .from("products")
      .select(
        "id, category_id, name, description, weight, price, image_url, is_active, is_available, is_featured, needs_verification, sort_order, product_options(id, product_id, name, price, is_active, sort_order)",
      )
      .eq("is_active", true),
  ]);

  if (cats.error || prods.error) {
    console.error("[menu]", cats.error?.message ?? prods.error?.message);
    return { categories: [], error: true };
  }

  const products = (prods.data as Product[]).map((p) => ({
    ...p,
    product_options: p.product_options.filter((o) => o.is_active).sort(bySort),
  }));

  const categories = cats.data
    .filter((c) => c.slug !== "combo" || combosEnabled)
    .sort(bySort)
    .map((c) => ({ ...c, products: products.filter((p) => p.category_id === c.id).sort(bySort) }));

  return { categories, error: false };
}
