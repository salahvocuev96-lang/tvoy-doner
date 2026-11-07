"use client";
import { useRef, useState } from "react";
import { useShop } from "@/components/cart/ShopProvider";
import { Sheet } from "@/components/ui/Sheet";
import { CloseIcon } from "@/components/ui/Icons";
import { QuantityStepper } from "@/components/cart/QuantityStepper";
import { formatPrice } from "@/lib/format";
import { MAX_QTY } from "@/lib/cart/store";
import type { Product } from "@/types";
import { ProductImage } from "./ProductImage";

export function ProductModal({ categorySlugs }: { categorySlugs: Record<string, string> }) {
  const { activeProduct, closeProduct } = useShop();
  return (
    <Sheet open={Boolean(activeProduct)} onClose={closeProduct} label={activeProduct?.name ?? "Товар"} variant="modal">
      {activeProduct && <ProductDetails key={activeProduct.id} product={activeProduct} slug={categorySlugs[activeProduct.category_id]} />}
    </Sheet>
  );
}

function ProductDetails({ product, slug }: { product: Product; slug?: string }) {
  const { addToCart, closeProduct } = useShop();
  const [selected, setSelected] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const btn = useRef<HTMLButtonElement>(null);
  const optionsTotal = product.product_options.filter((o) => selected.includes(o.id)).reduce((s, o) => s + o.price, 0);
  const total = (product.price + optionsTotal) * qty;

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="grid min-h-0 flex-1 overflow-y-auto sm:grid-cols-2 sm:overflow-hidden">
      <div className="relative">
        <ProductImage src={product.image_url} alt={product.name} category={slug} sizes="(max-width: 640px) 100vw, 440px" className="aspect-[4/3] h-full w-full sm:aspect-auto sm:min-h-[460px]" />
        <button type="button" onClick={closeProduct} className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-coffee/70 text-cream backdrop-blur transition-colors hover:bg-coffee sm:hidden" aria-label="Закрыть">
          <CloseIcon />
        </button>
      </div>

      <div className="flex min-h-0 flex-col p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold leading-tight sm:text-3xl">{product.name}</h2>
            {product.weight && <p className="mt-1 text-sm font-semibold text-cream/50">{product.weight}</p>}
          </div>
          <button type="button" onClick={closeProduct} className="hidden size-10 shrink-0 place-items-center rounded-full border border-cream/15 transition-colors hover:border-gold hover:text-gold sm:grid" aria-label="Закрыть">
            <CloseIcon />
          </button>
        </div>
        {product.description && <p className="mt-4 leading-relaxed text-cream/70">{product.description}</p>}

        <div className="mt-6 min-h-0 flex-1 sm:overflow-y-auto">
          {product.product_options.length > 0 && (
            <fieldset>
              <legend className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gold">Добавки</legend>
              <div className="space-y-2">
                {product.product_options.map((o) => {
                  const on = selected.includes(o.id);
                  return (
                    <label key={o.id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors ${on ? "border-gold bg-gold/10" : "border-cream/10 hover:border-cream/25"}`}>
                      <span className="flex items-center gap-3">
                        <input type="checkbox" className="size-4 accent-[#d99a45]" checked={on} onChange={() => toggle(o.id)} />
                        <span className="font-semibold">{o.name}</span>
                      </span>
                      <span className="text-sm font-bold text-gold">{o.price > 0 ? `+${formatPrice(o.price)}` : "бесплатно"}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}
        </div>

        <div className="mt-6 flex items-center gap-3 border-t border-cream/10 pt-5">
          <QuantityStepper value={qty} onChange={setQty} max={MAX_QTY} label={product.name} />
          <button
            ref={btn}
            type="button"
            disabled={!product.is_available}
            onClick={() => {
              addToCart(product, selected, qty, btn.current);
              closeProduct();
            }}
            className="flex flex-1 items-center justify-between gap-3 rounded-full bg-gold px-6 py-4 font-bold text-coffee transition-all hover:bg-gold-300 active:scale-[.98] disabled:cursor-not-allowed disabled:bg-cream/30"
          >
            <span>{product.is_available ? "В корзину" : "Нет в наличии"}</span>
            <span>{formatPrice(total)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
