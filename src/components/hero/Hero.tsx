"use client";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { StoreSettings } from "@/types";
import { ArrowIcon, ClockIcon, PinIcon } from "@/components/ui/Icons";
import { useShop } from "@/components/cart/ShopProvider";
import { ShawarmaStage } from "./ShawarmaStage";

const EASE = [0.16, 1, 0.3, 1] as const;

function shortAddress(address: string) {
  return address.replace(/^Москва,\s*/, "").replace("проспект ", "").replace(/,\s*корп\.\s*\d+/, "");
}

export function Hero({ settings }: { settings: StoreSettings }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { openCart, priced } = useShop();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0]);
  const wordX = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-18%"]);

  const lines = [["Настоящий", "вкус."], ["Настоящий", "донер."]];
  let w = 0;

  const onOrder = () => {
    if (priced.count > 0) openCart();
    else document.getElementById("menu")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section ref={ref} id="top" className="grain relative isolate overflow-hidden pt-[var(--header-h)]">
      {/* Фон */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_75%_40%,#3d2a1f_0%,#211712_60%)]" aria-hidden />
      <div className="pattern-girih absolute inset-0 -z-10 opacity-[0.05] [mask-image:radial-gradient(circle_at_70%_45%,black,transparent_70%)]" aria-hidden />
      <motion.div
        className="pointer-events-none absolute bottom-[4%] left-0 -z-10 whitespace-nowrap font-display text-[26vw] font-black leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_rgba(217,154,69,.14)] md:text-[19vw]"
        style={{ x: wordX }}
        aria-hidden
      >
        ДОНЕР · ДОНЕР
      </motion.div>

      <div className="mx-auto grid min-h-[calc(100svh-var(--header-h))] max-w-7xl grid-cols-1 content-center gap-x-8 px-5 pb-14 pt-4 [grid-template-areas:'head'_'stage'_'body'] sm:px-8 md:grid-cols-[1.05fr_1fr] md:pb-20 md:[grid-template-areas:'head_stage'_'body_stage']">
        <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-20 self-end [grid-area:head]">
          <motion.p
            className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-gold/25 bg-gold/[0.07] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-gold"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <span className="size-1.5 animate-pulse rounded-full bg-terracotta-400" />
            Oriental street food · Москва
          </motion.p>

          <h1 className="font-display text-[clamp(2.3rem,7.6vw,5.2rem)] font-extrabold leading-[0.98] tracking-tight">
            {lines.map((line, li) => (
              <span key={li} className="block">
                {line.map((word) => {
                  const i = w++;
                  return (
                    <span key={word + i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                      <motion.span
                        className={`inline-block pr-[0.22em] ${i % 2 ? "text-gold" : "text-cream"}`}
                        initial={{ y: "110%", rotate: 4 }}
                        animate={{ y: "0%", rotate: 0 }}
                        transition={{ duration: 1, delay: 0.15 + i * 0.1, ease: EASE }}
                      >
                        {word}
                      </motion.span>
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>
        </motion.div>

        <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-20 self-start [grid-area:body]">
          <motion.p
            className="mt-2 max-w-md text-base md:mt-6 leading-relaxed text-cream/70 sm:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: EASE }}
          >
            Горячая шаурма, свежие ингредиенты и любимая выпечка каждый день.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.75, ease: EASE }}
          >
            <a
              href="#menu"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-gold px-7 py-4 font-bold text-coffee shadow-[0_12px_40px_-12px_rgba(217,154,69,.8)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-300"
            >
              Посмотреть меню
              <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <button
              type="button"
              onClick={onOrder}
              className="inline-flex items-center justify-center rounded-full border border-cream/20 px-7 py-4 font-bold text-cream transition-all duration-300 hover:border-gold hover:text-gold"
            >
              Заказать сейчас
            </button>
          </motion.div>

          <motion.ul
            className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-cream/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-olive-300" /> Работаем ежедневно
            </li>
            <li className="flex items-center gap-2">
              <ClockIcon width={16} className="text-gold" /> {settings.openTime}–{settings.closeTime}
            </li>
            <li className="flex items-center gap-2">
              <PinIcon width={16} className="text-gold" /> Москва, {shortAddress(settings.address)}
            </li>
          </motion.ul>
        </motion.div>

        <div className="relative -my-6 max-md:max-h-[44svh] max-md:[&>div]:max-w-[min(340px,40svh)] md:my-0 md:self-center [grid-area:stage]">
          <ShawarmaStage label={settings.name} progress={scrollYProgress} />
        </div>
      </div>
    </section>
  );
}
