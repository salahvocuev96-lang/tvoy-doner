"use client";
import { MinusIcon, PlusIcon } from "@/components/ui/Icons";

export function QuantityStepper({ value, onChange, min = 1, max = 50, label, size = "md" }: { value: number; onChange: (v: number) => void; min?: number; max?: number; label: string; size?: "sm" | "md" }) {
  const s = size === "sm" ? "size-8" : "size-11";
  return (
    <div className="flex items-center rounded-full border border-cream/15 bg-coffee-900/50 p-1">
      <button type="button" className={`grid ${s} place-items-center rounded-full transition-colors hover:bg-cream/10 disabled:opacity-30`} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Уменьшить количество: ${label}`}>
        <MinusIcon width={16} />
      </button>
      <span className="min-w-8 text-center font-bold tabular-nums" aria-live="polite">{value}</span>
      <button type="button" className={`grid ${s} place-items-center rounded-full transition-colors hover:bg-cream/10 disabled:opacity-30`} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`Увеличить количество: ${label}`}>
        <PlusIcon width={16} />
      </button>
    </div>
  );
}
