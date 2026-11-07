"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/app/admin/actions";

/** Кнопка, вызывающая server action, с состоянием загрузки и сообщением. */
export function ActionButton({
  action,
  children,
  confirm,
  variant = "secondary",
  className = "",
}: {
  action: () => Promise<ActionResult>;
  children: React.ReactNode;
  confirm?: string;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const styles = {
    primary: "bg-gold text-coffee hover:bg-gold-300",
    secondary: "border border-cream/15 text-cream hover:border-gold hover:text-gold",
    danger: "border border-terracotta/50 text-terracotta-400 hover:bg-terracotta hover:text-cream",
  }[variant];

  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          start(async () => {
            const r = await action();
            setMsg(r.ok ? (r.message ? { ok: true, text: r.message } : null) : { ok: false, text: r.error });
            router.refresh();
          });
        }}
        className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors disabled:opacity-50 ${styles} ${className}`}
      >
        {pending ? "…" : children}
      </button>
      {msg && <span className={`mt-1 text-xs ${msg.ok ? "text-olive-300" : "text-terracotta-400"}`}>{msg.text}</span>}
    </span>
  );
}
