"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  motion,
  type MotionValue,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTime,
  useTransform,
} from "motion/react";
import { heroImage } from "@/config/media";
import { ShawarmaArt } from "./ShawarmaArt";
import { ingredientArt, type IngredientKind } from "./Ingredients";

interface Orbiter {
  kind: IngredientKind;
  size: number;   // px
  level: number;  // вертикальная позиция орбиты, доля высоты (-0.5…0.5)
  radius: number; // доля ширины сцены
  phase: number;  // начальный угол, рад
  speed: number;  // рад/сек
  spin: number;   // собственное вращение, град/сек
  mobile: boolean;
}

const ORBITERS: Orbiter[] = [
  { kind: "tomato", size: 74, level: -0.28, radius: 0.46, phase: 0.3, speed: 0.32, spin: 14, mobile: true },
  { kind: "cucumber", size: 60, level: 0.06, radius: 0.5, phase: 2.4, speed: 0.32, spin: -18, mobile: true },
  { kind: "onion", size: 56, level: -0.08, radius: 0.48, phase: 4.3, speed: 0.32, spin: 10, mobile: false },
  { kind: "chili", size: 86, level: 0.24, radius: 0.47, phase: 1.3, speed: 0.32, spin: 6, mobile: true },
  { kind: "leaf", size: 58, level: -0.36, radius: 0.4, phase: 3.4, speed: 0.32, spin: -8, mobile: true },
  { kind: "meat", size: 62, level: 0.34, radius: 0.42, phase: 5.3, speed: 0.32, spin: 12, mobile: false },
  { kind: "sesame", size: 34, level: -0.18, radius: 0.36, phase: 0.9 + Math.PI, speed: 0.32, spin: 30, mobile: false },
];

// Детерминированные «искры» (без Math.random — нет расхождений при гидратации)
const EMBERS = Array.from({ length: 12 }, (_, i) => ({
  left: 18 + ((i * 37) % 64),
  delay: (i * 0.73) % 5,
  duration: 4.5 + ((i * 1.3) % 3),
  size: 2 + (i % 3),
}));

export function ShawarmaStage({ label, progress }: { label: string; progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Мышь → наклон сцены
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 18 });
  const smy = useSpring(my, { stiffness: 60, damping: 18 });

  // Медленное «вращение» вокруг вертикальной оси
  const time = useTime();
  const sway = useTransform(time, (t) => (reduce ? 0 : Math.sin(t / 2600) * 20));
  const turn = useTransform(() => sway.get() + smx.get() * 12);
  const tiltX = useTransform(smy, (v) => -v * 8);
  const bob = useTransform(time, (t) => (reduce ? 0 : Math.sin(t / 1200) * 18));

  // Прокрутка → шаурма уходит вниз и уменьшается
  const scrollY = useTransform(progress, [0, 1], [0, reduce ? 0 : 160]);
  const scrollScale = useTransform(progress, [0, 1], [1, reduce ? 1 : 0.82]);
  const scrollRotate = useTransform(progress, [0, 1], [-6, reduce ? -6 : -18]);
  const glowScale = useTransform(progress, [0, 1], [1, 1.35]);

  useEffect(() => {
    if (reduce) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    const onMove = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, reduce]);

  // Орбита ингредиентов: прямое обновление transform без ре-рендеров React
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    let raf = 0;
    let visible = true;
    const start = performance.now();

    const render = (now: number) => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const elapsed = (now - start) / 1000;
      ORBITERS.forEach((o, i) => {
        const el = itemRefs.current[i];
        if (!el) return;
        if (isMobile && !o.mobile) {
          el.style.display = "none";
          return;
        }
        const a = o.phase + (reduce ? 0 : elapsed * o.speed);
        const depth = Math.sin(a); // -1 позади … 1 впереди
        const r = o.radius * w * (isMobile ? 0.92 : 1);
        const x = Math.cos(a) * r + smx.get() * depth * 26;
        const y = o.level * h + depth * 26 + smy.get() * depth * 18;
        const entry = reduce ? 1 : Math.min(1, Math.max(0, (elapsed - 0.6 - i * 0.12) / 0.7));
        const eased = 1 - Math.pow(1 - entry, 3);
        const scale = (0.62 + 0.42 * ((depth + 1) / 2)) * eased * (isMobile ? 0.78 : 1);
        el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale}) rotate(${elapsed * o.spin}deg)`;
        el.style.opacity = String(eased * (0.45 + 0.55 * ((depth + 1) / 2)));
        el.style.zIndex = depth > 0 ? "30" : "5";
      });
      if (!reduce && visible) raf = requestAnimationFrame(render);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(render);
    });
    io.observe(stage);
    raf = requestAnimationFrame(render);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reduce, smx, smy]);

  return (
    <motion.div
      ref={stageRef}
      className="relative mx-auto aspect-[4/5] w-full max-w-[min(520px,88vw)] [perspective:1200px]"
      style={{ y: scrollY }}
    >
      {/* Свечение и орбита */}
      <motion.div
        className="absolute left-1/2 top-[46%] size-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(217,154,69,.42)_0%,rgba(169,67,39,.18)_45%,transparent_70%)] blur-2xl"
        style={{ scale: glowScale }}
        aria-hidden
      />
      <div className="absolute left-1/2 top-[48%] h-[30%] w-[98%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-gold/25" aria-hidden />
      <div className="absolute left-1/2 top-[48%] h-[44%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-cream/[0.06]" aria-hidden />

      {/* Искры от гриля */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {EMBERS.map((e, i) => (
            <span
              key={i}
              className="ember absolute bottom-[18%] rounded-full bg-gold-300 motion-reduce:hidden"
              style={{ left: `${e.left}%`, width: e.size, height: e.size, animationDelay: `${e.delay}s`, animationDuration: `${e.duration}s` }}
            />
          ))}
      </div>

      {/* Ингредиенты на орбите */}
      {ORBITERS.map((o, i) => (
        <div
          key={o.kind}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          className="pointer-events-none absolute left-1/2 top-1/2 drop-shadow-[0_14px_18px_rgba(0,0,0,.45)] will-change-transform"
          style={{ width: o.size, opacity: 0 }}
          aria-hidden
        >
          {ingredientArt[o.kind]}
        </div>
      ))}

      {/* Шаурма */}
      <motion.div
        className="absolute inset-[-4%_4%_-2%] z-10 [transform-style:preserve-3d]"
        initial={{ opacity: 0, y: 80, scale: 0.86, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.3, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="h-full w-full"
          style={{ rotateY: turn, rotateX: tiltX, rotate: scrollRotate, scale: scrollScale, y: bob }}
        >
          {/* Пар */}
          <svg viewBox="0 0 200 120" className="pointer-events-none absolute -top-[14%] left-1/2 w-[56%] -translate-x-1/2 motion-reduce:hidden" aria-hidden>
              {[50, 100, 150].map((x, i) => (
                <path
                  key={x}
                  className="steam"
                  style={{ animationDelay: `${i * 0.9}s` }}
                  d={`M${x} 118 C ${x - 18} 90, ${x + 18} 70, ${x} 44 S ${x - 14} 14, ${x + 4} 0`}
                  fill="none"
                  stroke="#f4e6ce"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              ))}
            </svg>
          {heroImage ? (
            <Image src={heroImage} alt={label} fill priority sizes="(max-width: 768px) 80vw, 480px" className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,.6)]" />
          ) : (
            <ShawarmaArt turn={turn} label={label} />
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
