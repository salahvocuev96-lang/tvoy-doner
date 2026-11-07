"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { cart, useCartLines } from "@/lib/cart/store";
import { priceCart } from "@/lib/cart/pricing";
import type { Product, StoreSettings } from "@/types";

interface Fly { id: number; x: number; y: number; tx: number; ty: number }
interface Toast { id: number; text: string }

interface ShopContextValue {
  settings: StoreSettings;
  products: Map<string, Product>;
  priced: ReturnType<typeof priceCart>;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  activeProduct: Product | null;
  openProduct: (p: Product) => void;
  closeProduct: () => void;
  addToCart: (p: Product, optionIds?: string[], qty?: number, origin?: HTMLElement | null) => void;
  cartButtonRef: React.RefObject<HTMLButtonElement | null>;
  bump: number;
  notify: (text: string) => void;
}

const ShopContext = createContext<ShopContextValue | null>(null);

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}

export function ShopProvider({
  products: list,
  settings,
  children,
}: {
  products: Product[];
  settings: StoreSettings;
  children: React.ReactNode;
}) {
  const products = useMemo(() => new Map(list.map((p) => [p.id, p])), [list]);
  const lines = useCartLines();
  const priced = useMemo(() => priceCart(lines, products), [lines, products]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [flies, setFlies] = useState<Fly[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [bump, setBump] = useState(0);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const idRef = useRef(0);

  // Убираем из корзины товары, которых больше нет в меню.
  useEffect(() => {
    if (list.length === 0) return;
    cart.prune((l) => {
      const p = products.get(l.productId);
      return Boolean(p && p.is_available && l.optionIds.every((id) => p.product_options.some((o) => o.id === id)));
    });
  }, [list.length, products]);

  const notify = useCallback((text: string) => {
    const id = ++idRef.current;
    setToasts((t) => [...t.slice(-2), { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const addToCart = useCallback<ShopContextValue["addToCart"]>(
    (p, optionIds = [], qty = 1, origin) => {
      cart.add(p.id, optionIds, qty);
      setBump((b) => b + 1);
      notify(`«${p.name}» в корзине`);
      const target = cartButtonRef.current?.getBoundingClientRect();
      const from = origin?.getBoundingClientRect();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (target && from && !reduce) {
        const id = ++idRef.current;
        setFlies((f) => [
          ...f,
          {
            id,
            x: from.left + from.width / 2,
            y: from.top + from.height / 2,
            tx: target.left + target.width / 2,
            ty: target.top + target.height / 2,
          },
        ]);
      }
    },
    [notify],
  );

  const value: ShopContextValue = {
    settings,
    products,
    priced,
    cartOpen,
    openCart: () => {
      setActiveProduct(null);
      setCartOpen(true);
    },
    closeCart: () => setCartOpen(false),
    activeProduct,
    openProduct: setActiveProduct,
    closeProduct: () => setActiveProduct(null),
    addToCart,
    cartButtonRef,
    bump,
    notify,
  };

  return (
    <ShopContext.Provider value={value}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>

      {/* Летящий в корзину «шарик» */}
      <div className="pointer-events-none fixed inset-0 z-[90]" aria-hidden>
        {flies.map((f) => (
          <motion.span
            key={f.id}
            className="absolute left-0 top-0 size-4 rounded-full bg-gold shadow-[0_0_24px_6px_rgba(217,154,69,.55)]"
            initial={{ x: f.x - 8, y: f.y - 8, scale: 1, opacity: 1 }}
            animate={{ x: [f.x - 8, (f.x + f.tx) / 2 - 8, f.tx - 8], y: [f.y - 8, Math.min(f.y, f.ty) - 120, f.ty - 8], scale: [1, 1.3, 0.4], opacity: [1, 1, 0.2] }}
            transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
            onAnimationComplete={() => setFlies((all) => all.filter((x) => x.id !== f.id))}
          />
        ))}
      </div>

      {/* Уведомления */}
      <div className="pointer-events-none fixed inset-x-0 top-[calc(var(--header-h)+8px)] z-[95] flex flex-col items-center gap-2 px-4 sm:top-auto sm:bottom-5" role="status" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className="flex items-center gap-3 rounded-full border border-gold/30 bg-coffee-800/95 px-5 py-3 text-sm font-semibold text-cream shadow-2xl shadow-black/40 backdrop-blur"
            >
              <span className="grid size-6 place-items-center rounded-full bg-olive text-xs">✓</span>
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ShopContext.Provider>
  );
}
