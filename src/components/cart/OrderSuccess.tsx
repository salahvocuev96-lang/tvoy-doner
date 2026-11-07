"use client";
import { motion } from "motion/react";
import { useShop } from "./ShopProvider";
import { PhoneIcon } from "@/components/ui/Icons";
import { formatPrice, telHref } from "@/lib/format";
import type { OrderResult } from "./CheckoutForm";

export function OrderSuccess({ result, onClose }: { result: OrderResult; onClose: () => void }) {
  const { settings } = useShop();
  return (
    <div className="flex flex-1 flex-col items-center overflow-y-auto px-6 py-10 text-center">
      <motion.div
        className="relative grid size-28 place-items-center rounded-full bg-olive"
        initial={{ scale: 0, rotate: -40 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
      >
        <motion.span className="absolute inset-0 rounded-full border-2 border-olive-300" initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ duration: 1.4, repeat: Infinity }} />
        <svg viewBox="0 0 48 48" className="size-14" aria-hidden>
          <motion.path d="M12 25l8 8 16-18" fill="none" stroke="#f4e6ce" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.5 }} />
        </svg>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <p className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-gold">Номер заказа</p>
        <p className="mt-2 font-display text-5xl font-extrabold tracking-tight">{result.orderNumber}</p>
        <p className="mt-5 text-cream/70">
          Спасибо! Мы получили заказ на <b className="text-cream">{formatPrice(result.total)}</b> и скоро начнём готовить.
        </p>
        <div className="mt-8 rounded-3xl border border-cream/10 bg-coffee-900/50 p-5 text-left text-sm">
          <p className="font-bold">Самовывоз</p>
          <p className="mt-1 text-cream/65">{settings.address}{settings.addressNote ? `, ${settings.addressNote.toLowerCase()}` : ""}</p>
          <p className="mt-3 text-cream/65">Назовите номер заказа на кассе. Оплата наличными или картой при получении.</p>
          <a href={telHref(settings.phone)} className="mt-4 inline-flex items-center gap-2 font-bold text-gold">
            <PhoneIcon width={16} /> {settings.phone}
          </a>
        </div>
        <button type="button" onClick={onClose} className="mt-8 w-full rounded-full bg-gold py-4 font-bold text-coffee transition-colors hover:bg-gold-300">
          Отлично
        </button>
      </motion.div>
    </div>
  );
}
