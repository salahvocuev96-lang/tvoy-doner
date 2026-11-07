"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { MenuCategory } from "@/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "./ProductCard";

export function MenuSection({ categories, unavailable }: { categories: MenuCategory[]; unavailable: boolean }) {
  const withProducts = useMemo(() => categories.filter((c) => c.products.length > 0), [categories]);
  const [active, setActive] = useState<string | null>(null);
  const current = withProducts.find((c) => c.id === active) ?? withProducts[0];

  return (
    <section id="menu" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Меню"
          title={<>Всё, что мы <span className="text-gold">готовим</span></>}
          text="Выберите категорию, добавьте блюда в корзину и заберите заказ в заведении."
        />

        {withProducts.length === 0 ? (
          <div className="mt-14 rounded-[32px] border border-dashed border-cream/15 bg-coffee-800/40 p-10 text-center">
            <p className="font-display text-2xl font-bold text-cream">Меню скоро появится здесь</p>
            <p className="mx-auto mt-3 max-w-md text-cream/60">
              {unavailable
                ? "Не удалось загрузить меню. Попробуйте обновить страницу или позвоните нам."
                : "Мы готовим онлайн-меню. А пока — приходите или звоните, расскажем обо всём."}
            </p>
          </div>
        ) : (
          <>
            {/* Вкладки категорий */}
            <div className="sticky top-[calc(var(--header-h)-4px)] z-30 -mx-5 mt-12 px-5 py-3 sm:mx-0 sm:px-0">
              <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-full border border-cream/10 bg-coffee-900/80 p-1.5 backdrop-blur-xl sm:inline-flex" role="tablist" aria-label="Категории меню">
                {withProducts.map((c) => {
                  const isActive = c.id === current?.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActive(c.id)}
                      className={`relative shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-colors duration-300 ${isActive ? "text-coffee" : "text-cream/70 hover:text-cream"}`}
                    >
                      {isActive && <motion.span layoutId="cat-pill" className="absolute inset-0 -z-10 rounded-full bg-gold" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                      {c.name}
                      <span className={`ml-1.5 text-xs ${isActive ? "text-coffee/60" : "text-cream/35"}`}>{c.products.length}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current?.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                role="tabpanel"
              >
                {current?.products.map((p, i) => <ProductCard key={p.id} product={p} categorySlug={current.slug} index={i} />)}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </section>
  );
}
