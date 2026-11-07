"use client";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * Модальная панель. На телефоне — выезжает снизу, на десктопе —
 * справа (variant="drawer") или по центру (variant="modal").
 */
export function Sheet({
  open,
  onClose,
  label,
  variant = "drawer",
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  variant?: "drawer" | "modal";
  children: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    const t = setTimeout(() => panel.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prevOverflow;
      prev?.focus?.();
    };
  }, [open, onClose]);

  const isDrawer = variant === "drawer";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            className={`absolute flex max-h-[92svh] flex-col overflow-hidden bg-coffee-800 text-cream shadow-2xl shadow-black/60 outline-none inset-x-0 bottom-0 rounded-t-[32px] ${
              isDrawer
                ? "sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[440px] sm:rounded-none sm:rounded-l-[32px]"
                : "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(880px,94vw)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[32px]"
            }`}
            initial={reduce ? { opacity: 0 } : { y: "100%", opacity: 1 }}
            animate={{ y: 0, x: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: "100%", opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
          >
            <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-cream/20 sm:hidden" aria-hidden />
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
