"use client";
import { useRef } from "react";
import { motion } from "motion/react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";
import { useShop } from "@/components/cart/ShopProvider";
import { PlusIcon } from "@/components/ui/Icons";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product, categorySlug, index = 0, variant = "grid" }: { product: Product; categorySlug?: string; index?: number; variant?: "grid" | "featured" }) {
  const { addToCart, openProduct } = useShop();
  const btn = useRef<HTMLButtonElement>(null);
  const hasOptions = product.product_options.length > 0;
  const disabled = !product.is_available;

  const onAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (hasOptions) openProduct(product);
    else addToCart(product, [], 1, btn.current);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.6, delay: Math.min(index, 6) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-[28px] border border-cream/[0.07] bg-coffee-800/70 transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-1 hover:border-gold/30 hover:shadow-[0_30px_60px_-30px_rgba(217,154,69,.45)] ${disabled ? "opacity-60" : ""} ${variant === "featured" ? "w-[78vw] shrink-0 snap-start sm:w-[340px]" : ""}`}
      onClick={() => openProduct(product)}
    >
      <div className="relative overflow-hidden">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          category={categorySlug}
          className="aspect-[4/3] w-full transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.is_featured && <span className="rounded-full bg-terracotta px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cream">Хит</span>}
          {disabled && <span className="rounded-full bg-coffee/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cream/80">Нет в наличии</span>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold leading-tight text-cream">{product.name}</h3>
          {product.weight && <span className="mt-0.5 shrink-0 text-xs font-semibold text-cream/45">{product.weight}</span>}
        </div>
        {product.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-cream/55">{product.description}</p>}
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="font-display text-xl font-bold text-gold">{formatPrice(product.price)}</span>
          <button
            ref={btn}
            type="button"
            onClick={onAdd}
            disabled={disabled}
            aria-label={hasOptions ? `Выбрать добавки: ${product.name}` : `Добавить в корзину: ${product.name}`}
            className="flex items-center gap-1.5 rounded-full bg-cream px-4 py-2.5 text-sm font-bold text-coffee transition-all duration-300 hover:bg-gold active:scale-90 disabled:cursor-not-allowed disabled:bg-cream/30"
          >
            <PlusIcon width={16} className="transition-transform duration-300 group-hover:rotate-90" />
            {hasOptions ? "Выбрать" : "В корзину"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
