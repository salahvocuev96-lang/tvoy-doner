"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveSettings } from "@/app/admin/actions";
import { Card, inputCls } from "./ui";
import type { StoreSettings } from "@/types";

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [f, setF] = useState({
    name: settings.name,
    phone: settings.phone,
    address: settings.address,
    address_note: settings.addressNote ?? "",
    postal_code: settings.postalCode ?? "",
    hours_text: settings.hoursText,
    open_time: settings.openTime,
    close_time: settings.closeTime,
    ordering_enabled: settings.orderingEnabled,
    combos_enabled: settings.combosEnabled,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));
  const label = "mb-1.5 block text-sm font-semibold text-cream/70";

  const text = (k: "name" | "phone" | "address" | "address_note" | "postal_code" | "hours_text", l: string, max: number) => (
    <label className="block">
      <span className={label}>{l}</span>
      <input className={inputCls} value={f[k]} maxLength={max} onChange={(e) => set(k, e.target.value)} />
    </label>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await saveSettings(f);
          setMsg(r.ok ? { ok: true, text: r.message ?? "Сохранено" } : { ok: false, text: r.error });
          router.refresh();
        });
      }}
    >
      <Card className="space-y-4">
        {text("name", "Название заведения", 80)}
        <div className="grid gap-4 sm:grid-cols-2">
          {text("phone", "Телефон", 40)}
          {text("hours_text", "График (текст на сайте)", 120)}
        </div>
        {text("address", "Адрес", 200)}
        <div className="grid gap-4 sm:grid-cols-2">
          {text("address_note", "Уточнение (этаж, вход)", 200)}
          {text("postal_code", "Индекс", 12)}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>Открытие</span>
            <input type="time" className={inputCls} value={f.open_time} onChange={(e) => set("open_time", e.target.value)} />
          </label>
          <label className="block">
            <span className={label}>Закрытие</span>
            <input type="time" className={inputCls} value={f.close_time} onChange={(e) => set("close_time", e.target.value)} />
          </label>
        </div>
        <p className="text-xs text-cream/40">Онлайн-заказы принимаются только в это время (по Москве).</p>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" className="size-4 accent-[#d99a45]" checked={f.ordering_enabled} onChange={(e) => set("ordering_enabled", e.target.checked)} />
          Принимать онлайн-заказы
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" className="size-4 accent-[#d99a45]" checked={f.combos_enabled} onChange={(e) => set("combos_enabled", e.target.checked)} />
          Показывать комбо-наборы на сайте
        </label>
        {msg && <p className={`rounded-xl px-4 py-3 text-sm ${msg.ok ? "bg-olive/25" : "bg-terracotta/15 text-terracotta-400"}`}>{msg.text}</p>}
        <button type="submit" disabled={pending} className="rounded-xl bg-gold px-6 py-3 font-bold text-coffee hover:bg-gold-300 disabled:opacity-50">
          {pending ? "Сохраняем…" : "Сохранить"}
        </button>
      </Card>
    </form>
  );
}
