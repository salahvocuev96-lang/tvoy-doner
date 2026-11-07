"use client";
import { useRef, useState } from "react";
import { motion } from "motion/react";
import { useShop } from "./ShopProvider";
import { ArrowIcon, CardIcon, CashIcon, PinIcon } from "@/components/ui/Icons";
import { formatPrice } from "@/lib/format";
import { isOpenNow } from "@/lib/hours";
import type { PaymentMethod } from "@/types";

export interface OrderResult {
  orderNumber: string;
  total: number;
}

function maskPhone(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("8") || d.startsWith("7")) d = d.slice(1);
  d = d.slice(0, 10);
  let out = "+7";
  if (d.length) out += ` (${d.slice(0, 3)}`;
  if (d.length >= 3) out += ")";
  if (d.length > 3) out += ` ${d.slice(3, 6)}`;
  if (d.length > 6) out += `-${d.slice(6, 8)}`;
  if (d.length > 8) out += `-${d.slice(8, 10)}`;
  return out;
}

const field =
  "w-full rounded-2xl border border-cream/12 bg-coffee-900/60 px-4 py-3.5 text-cream placeholder:text-cream/30 transition-colors focus:border-gold focus:outline-none";

export function CheckoutForm({ onBack, onSuccess }: { onBack: () => void; onSuccess: (r: OrderResult) => void }) {
  const { priced, settings } = useShop();
  // Один ключ на попытку оформления: повторное нажатие не создаст второй заказ.
  const keyRef = useRef<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const open = isOpenNow(settings.openTime, settings.closeTime);
  const blocked = !settings.orderingEnabled || !open;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (name.trim().length < 2) return setError("Введите имя");
    if (phone.replace(/\D/g, "").length !== 11) return setError("Введите номер телефона полностью");

    setSubmitting(true);
    keyRef.current ??= crypto.randomUUID();
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: keyRef.current,
          customerName: name,
          customerPhone: phone,
          comment,
          paymentMethod: payment,
          items: priced.lines.map((l) => ({ productId: l.productId, quantity: l.quantity, optionIds: l.optionIds })),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Не удалось оформить заказ");
      onSuccess({ orderNumber: json.orderNumber, total: json.total });
    } catch (err) {
      setError(err instanceof Error && err.message !== "Failed to fetch" ? err.message : "Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col" noValidate>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
        {blocked && (
          <div className="rounded-2xl border border-terracotta/40 bg-terracotta/10 p-4 text-sm text-cream/85">
            {!settings.orderingEnabled
              ? "Онлайн-заказы временно не принимаются. Позвоните нам, пожалуйста."
              : `Сейчас мы закрыты. Заказы принимаются ${settings.openTime}–${settings.closeTime} по московскому времени.`}
          </div>
        )}

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-cream/70">Имя</span>
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" maxLength={60} placeholder="Как к вам обращаться" required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-cream/70">Телефон</span>
          <input className={field} value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} onFocus={() => !phone && setPhone("+7")} inputMode="tel" autoComplete="tel" placeholder="+7 (___) ___-__-__" required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-cream/70">Комментарий <span className="text-cream/35">— необязательно</span></span>
          <textarea className={`${field} min-h-24 resize-none`} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} placeholder="Например: без лука, подойду к 19:30" />
        </label>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-cream/70">Оплата при получении</legend>
          <div className="grid grid-cols-2 gap-2">
            {([["cash", "Наличными", CashIcon], ["card", "Картой", CardIcon]] as const).map(([value, label, Icon]) => (
              <label key={value} className={`relative flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 transition-colors ${payment === value ? "border-gold bg-gold/10" : "border-cream/12 hover:border-cream/25"}`}>
                <input type="radio" name="payment" value={value} checked={payment === value} onChange={() => setPayment(value)} className="sr-only" />
                <Icon className={payment === value ? "text-gold" : "text-cream/50"} />
                <span className="text-sm font-bold">{label}</span>
                <span className="text-xs text-cream/45">в заведении</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-3 rounded-2xl bg-olive/15 p-4 text-sm">
          <PinIcon className="mt-0.5 shrink-0 text-olive-300" />
          <div>
            <p className="font-bold">Самовывоз</p>
            <p className="text-cream/65">{settings.address}{settings.addressNote ? `, ${settings.addressNote.toLowerCase()}` : ""}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/10 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
        {error && (
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-3 rounded-xl bg-terracotta/15 px-4 py-2.5 text-sm text-terracotta-400" role="alert">
            {error}
          </motion.p>
        )}
        <div className="mb-4 flex items-baseline justify-between">
          <span className="font-bold">К оплате</span>
          <span className="font-display text-2xl font-bold text-gold">{formatPrice(priced.total)}</span>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onBack} className="grid size-14 shrink-0 place-items-center rounded-full border border-cream/15 transition-colors hover:border-gold" aria-label="Назад в корзину">
            <ArrowIcon className="rotate-180" />
          </button>
          <button type="submit" disabled={submitting || blocked || priced.lines.length === 0} className="relative flex-1 overflow-hidden rounded-full bg-gold py-4 font-bold text-coffee transition-all hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-coffee/30 border-t-coffee" /> Отправляем…
              </span>
            ) : (
              "Подтвердить заказ"
            )}
          </button>
        </div>
        <p className="mt-3 text-center text-[11px] leading-snug text-cream/35">Нажимая кнопку, вы соглашаетесь на обработку имени и телефона для выполнения заказа.</p>
      </div>
    </form>
  );
}
