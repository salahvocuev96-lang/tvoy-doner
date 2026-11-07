import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { Card, PageTitle } from "@/components/admin/ui";
import { ProductToggle } from "@/components/admin/ProductToggle";
import { CategoryManager } from "@/components/admin/CategoryManager";
import type { Category, Product } from "@/types";

export default async function MenuAdminPage() {
  const { supabase } = await requireAdmin();
  const [{ data: cats }, { data: prods }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("products").select("*, product_options(id)").order("sort_order").order("name"),
  ]);
  const categories = (cats ?? []) as Category[];
  const products = (prods ?? []) as Product[];
  const needCheck = products.filter((p) => p.needs_verification).length;

  return (
    <>
      <PageTitle title="Меню">
        <Link href="/admin/menu/new" className="rounded-xl bg-gold px-4 py-2 text-sm font-bold text-coffee hover:bg-gold-300">+ Добавить товар</Link>
      </PageTitle>

      {needCheck > 0 && (
        <p className="mb-5 rounded-2xl border border-gold/30 bg-gold/10 px-5 py-3 text-sm text-gold">
          Товаров с пометкой «сверить с меню»: {needCheck}. Проверьте названия, цены и граммовки.
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {categories.map((c) => {
            const list = products.filter((p) => p.category_id === c.id);
            return (
              <section key={c.id}>
                <h2 className="mb-3 flex items-center gap-3 font-display text-lg font-bold">
                  {c.name}
                  {!c.is_active && <span className="rounded-full bg-cream/10 px-2.5 py-0.5 font-sans text-xs text-cream/50">скрыта</span>}
                  <span className="font-sans text-sm font-normal text-cream/40">{list.length}</span>
                </h2>
                {list.length === 0 ? (
                  <Card><p className="text-sm text-cream/45">Нет товаров.</p></Card>
                ) : (
                  <div className="space-y-2">
                    {list.map((p) => (
                      <div key={p.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cream/10 bg-coffee-800/70 p-4 ${p.is_active ? "" : "opacity-60"}`}>
                        <Link href={`/admin/menu/${p.id}`} className="min-w-0 flex-1 hover:text-gold">
                          <p className="font-bold">
                            {p.name}
                            {p.needs_verification && <span className="ml-2 text-xs font-semibold text-gold">⚠ сверить</span>}
                          </p>
                          <p className="text-xs text-cream/45">
                            {formatPrice(p.price)}{p.weight ? ` · ${p.weight}` : ""}{p.product_options.length ? ` · добавок: ${p.product_options.length}` : ""}{p.image_url ? " · есть фото" : ""}
                          </p>
                        </Link>
                        <div className="flex flex-wrap gap-1.5">
                          <ProductToggle id={p.id} field="is_available" value={p.is_available} on="В наличии" off="Нет в наличии" />
                          <ProductToggle id={p.id} field="is_active" value={p.is_active} on="На сайте" off="Скрыт" />
                          <ProductToggle id={p.id} field="is_featured" value={p.is_featured} on="Хит" off="Не хит" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
        <CategoryManager categories={categories} />
      </div>
    </>
  );
}
