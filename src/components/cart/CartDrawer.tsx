"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useShop } from "./ShopProvider";
import { Sheet } from "@/components/ui/Sheet";
import { BagIcon, CloseIcon, TrashIcon } from "@/components/ui/Icons";
import { QuantityStepper } from "./QuantityStepper";
import { CheckoutForm, type OrderResult } from "./CheckoutForm";
import { OrderSuccess } from "./OrderSuccess";
import { cart, MAX_QTY } from "@/lib/cart/store";
import { formatPrice, pluralize } from "@/lib/format";

type View = "cart" | "checkout" | "success";

export function CartDrawer() {
  const { cartOpen, closeCart, priced } = useShop();
  const [view, setView] = useState<View>("cart");
  const [result, setResult] = useState<OrderResult | null>(null);

  const close = () => {
    closeCart();
    if (view === "success") setTimeout(() => setView("cart"), 400);
  };

  const title = view === "checkout" ? "Оформление заказа" : view === "success" ? "Заказ принят" : "Ваш заказ";

  return (
    <Sheet open={cartOpen} onClose={close} label={title}>
      <div className="flex items-center justify-between gap-4 border-b border-cream/10 px-6 py-5">
        <div>
          <h2 className="font-display text-xl font-bold">{title}</h2>
          {view === "cart" && priced.count > 0 && (
            <p className="text-sm text-cream/50">{priced.count} {pluralize(priced.count, ["позиция", "позиции", "позиций"])}</p>
          )}
        </div>
        <button type="button" onClick={close} className="grid size-10 place-items-center rounded-full border border-cream/15 transition-colors hover:border-gold hover:text-gold" aria-label="Закрыть корзину">
          <CloseIcon />
        </button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          className="flex min-h-0 flex-1 flex-col"
          initial={{ opacity: 0, x: view === "cart" ? -30 : 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: view === "cart" ? -30 : 30 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {view === "success" && result ? (
            <OrderSuccess result={result} onClose={close} />
          ) : view === "checkout" ? (
            <CheckoutForm
              onBack={() => setView("cart")}
              onSuccess={(r) => {
                setResult(r);
                cart.clear();
                setView("success");
              }}
            />
          ) : priced.lines.length === 0 ? (
            <EmptyCart onClose={close} />
          ) : (
            <>
              <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5">
                <AnimatePresence initial={false}>
                  {priced.lines.map((l) => (
                    <motion.li
                      key={l.key}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-3xl border border-cream/[0.08] bg-coffee-900/40 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-bold leading-snug">{l.product.name}</p>
                            {l.options.length > 0 && <p className="mt-1 text-xs text-cream/55">+ {l.options.map((o) => o.name).join(", ")}</p>}
                            <p className="mt-1 text-xs text-cream/40">{formatPrice(l.unitPrice)} за шт.</p>
                          </div>
                          <button type="button" onClick={() => cart.remove(l.key)} className="grid size-9 shrink-0 place-items-center rounded-full text-cream/40 transition-colors hover:bg-terracotta/20 hover:text-terracotta-400" aria-label={`Удалить: ${l.product.name}`}>
                            <TrashIcon width={18} />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <QuantityStepper size="sm" value={l.quantity} max={MAX_QTY} onChange={(v) => cart.setQuantity(l.key, v)} label={l.product.name} />
                          <motion.span key={l.lineTotal} initial={{ scale: 1.15, color: "#e9b872" }} animate={{ scale: 1, color: "#f4e6ce" }} className="font-display font-bold">
                            {formatPrice(l.lineTotal)}
                          </motion.span>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
              <div className="border-t border-cream/10 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
                <div className="mb-1 flex justify-between text-sm text-cream/60"><span>Получение</span><span>Самовывоз</span></div>
                <div className="mb-5 flex items-baseline justify-between">
                  <span className="font-bold">Итого</span>
                  <span className="font-display text-2xl font-bold text-gold">{formatPrice(priced.total)}</span>
                </div>
                <button type="button" onClick={() => setView("checkout")} className="w-full rounded-full bg-gold py-4 font-bold text-coffee transition-all hover:bg-gold-300 active:scale-[.98]">
                  Оформить заказ
                </button>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </Sheet>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
      <motion.div
        className="relative mb-6 grid size-28 place-items-center rounded-full bg-gold/10 text-gold"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="absolute inset-0 rounded-full border border-dashed border-gold/30" />
        <BagIcon width={44} height={44} />
      </motion.div>
      <p className="font-display text-xl font-bold">Корзина пока пуста</p>
      <p className="mt-2 max-w-xs text-sm text-cream/55">Загляните в меню — там горячая шаурма, выпечка и напитки.</p>
      <a href="#menu" onClick={onClose} className="mt-7 rounded-full bg-gold px-7 py-3.5 font-bold text-coffee transition-colors hover:bg-gold-300">
        Перейти к меню
      </a>
    </div>
  );
}
