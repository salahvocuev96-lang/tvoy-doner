"use client";
import { useRef } from "react";
import type { MenuCategory } from "@/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowIcon } from "@/components/ui/Icons";
import { ProductCard } from "./ProductCard";

/** «Популярные блюда» — товары с отметкой is_featured. Секция скрыта, если таких нет. */
export function PopularSection({ categories }: { categories: MenuCategory[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const items = categories.flatMap((c) => c.products.filter((p) => p.is_featured).map((p) => ({ p, slug: c.slug })));
  if (items.length === 0) return null;

  const scroll = (dir: number) => scroller.current?.scrollBy({ left: dir * 360, behavior: "smooth" });

  return (
    <section id="popular" className="relative py-24 sm:py-28">
      <div className="mx-auto flex max-w-7xl items-end justify-between gap-6 px-5 sm:px-8">
        <SectionHeading eyebrow="Популярное" title={<>Любимое <span className="text-gold">гостями</span></>} />
        <div className="hidden gap-2 sm:flex">
          <button type="button" onClick={() => scroll(-1)} className="grid size-12 place-items-center rounded-full border border-cream/15 transition-colors hover:border-gold hover:text-gold" aria-label="Назад">
            <ArrowIcon className="rotate-180" />
          </button>
          <button type="button" onClick={() => scroll(1)} className="grid size-12 place-items-center rounded-full border border-cream/15 transition-colors hover:border-gold hover:text-gold" aria-label="Вперёд">
            <ArrowIcon />
          </button>
        </div>
      </div>
      <div ref={scroller} className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-5 px-5 pb-4 sm:scroll-px-8 sm:px-8 xl:px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
        {items.map(({ p, slug }, i) => (
          <ProductCard key={p.id} product={p} categorySlug={slug} index={i} variant="featured" />
        ))}
      </div>
    </section>
  );
}
