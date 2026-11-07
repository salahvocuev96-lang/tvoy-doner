"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useShop } from "@/components/cart/ShopProvider";
import { BagIcon, CloseIcon, MenuIcon, PhoneIcon } from "@/components/ui/Icons";
import { Wordmark } from "@/components/ui/Wordmark";
import { telHref } from "@/lib/format";

const NAV = [
  { href: "#top", label: "Главная" },
  { href: "#menu", label: "Меню" },
  { href: "#about", label: "О заведении" },
  { href: "#reviews", label: "Отзывы" },
  { href: "#contacts", label: "Контакты" },
];

export function Header() {
  const { settings, priced, openCart, cartButtonRef, bump } = useShop();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#top");

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  useEffect(() => {
    const sections = NAV.map((n) => document.querySelector(n.href)).filter(Boolean) as Element[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? "py-2" : "py-4"
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-all duration-500 sm:px-6 ${
            scrolled ? "max-w-6xl" : ""
          }`}
        >
          <div
            className={`flex w-full items-center justify-between gap-4 rounded-full px-4 py-2.5 transition-all duration-500 sm:px-5 ${
              scrolled
                ? "border border-cream/10 bg-coffee-900/75 shadow-[0_10px_40px_-10px_rgba(0,0,0,.6)] backdrop-blur-xl"
                : "border border-transparent"
            }`}
          >
            <a href="#top" className="shrink-0 text-xl sm:text-2xl" aria-label={`${settings.name} — на главную`}>
              <Wordmark name={settings.name} />
            </a>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Основная навигация">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active === n.href ? "text-coffee" : "text-cream/75 hover:text-cream"
                  }`}
                >
                  {active === n.href && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-cream" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                  )}
                  {n.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <a
                href={telHref(settings.phone)}
                className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-cream/80 transition-colors hover:text-gold xl:flex"
              >
                <PhoneIcon width={16} /> {settings.phone}
              </a>
              <button
                ref={cartButtonRef}
                type="button"
                onClick={openCart}
                className="relative flex items-center gap-2 rounded-full bg-gold px-4 py-2.5 text-sm font-bold text-coffee transition-all hover:bg-gold-300 active:scale-95"
                aria-label={`Корзина, товаров: ${priced.count}`}
              >
                <motion.span key={bump} animate={bump ? { rotate: [0, -14, 10, 0], scale: [1, 1.25, 1] } : undefined} transition={{ duration: 0.5 }}>
                  <BagIcon />
                </motion.span>
                <span className="hidden sm:inline">Корзина</span>
                <AnimatePresence>
                  {priced.count > 0 && (
                    <motion.span
                      key={priced.count}
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 22 }}
                      className="grid min-w-6 place-items-center rounded-full bg-coffee px-1.5 text-xs font-extrabold text-gold"
                    >
                      {priced.count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-full border border-cream/15 text-cream lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Открыть меню"
                aria-expanded={open}
              >
                <MenuIcon />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-coffee-900/97 px-6 pb-10 pt-6 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0, clipPath: "circle(0% at 92% 4%)" }}
            animate={{ opacity: 1, clipPath: "circle(150% at 92% 4%)" }}
            exit={{ opacity: 0, clipPath: "circle(0% at 92% 4%)" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Навигация"
          >
            <div className="flex items-center justify-between">
              <Wordmark name={settings.name} className="text-xl" />
              <button type="button" className="grid size-11 place-items-center rounded-full border border-cream/15" onClick={() => setOpen(false)} aria-label="Закрыть меню">
                <CloseIcon />
              </button>
            </div>
            <nav className="mt-14 flex flex-col gap-2" aria-label="Мобильная навигация">
              {NAV.map((n, i) => (
                <motion.a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-cream/10 py-4 font-display text-3xl font-bold text-cream"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="mr-4 font-sans text-sm text-gold">0{i + 1}</span>
                  {n.label}
                </motion.a>
              ))}
            </nav>
            <div className="mt-auto space-y-2 text-cream/70">
              <a href={telHref(settings.phone)} className="flex items-center gap-2 text-lg font-bold text-gold">
                <PhoneIcon /> {settings.phone}
              </a>
              <p className="text-sm">{settings.hoursText}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
