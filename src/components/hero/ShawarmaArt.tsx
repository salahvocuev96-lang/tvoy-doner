"use client";
import { motion, type MotionValue, useTransform } from "motion/react";

/**
 * Векторная иллюстрация шаурмы в крафтовой обёртке.
 * Блик на лаваше и бумаге смещается вместе с поворотом (rotateY) —
 * это создаёт ощущение объёма при вращении.
 */
export function ShawarmaArt({ turn, label }: { turn: MotionValue<number>; label: string }) {
  const shineX = useTransform(turn, [-25, 25], [40, 230]);
  const shineOpacity = useTransform(turn, [-25, 0, 25], [0.16, 0.3, 0.16]);

  // Рваный край бумаги
  const teeth: string[] = [];
  for (let x = 74, i = 0; x <= 286; x += 10.6, i++) teeth.push(`${x.toFixed(1)} ${i % 2 ? 308 : 296}`);

  return (
    <svg viewBox="0 0 360 600" className="h-full w-full overflow-visible" role="img" aria-label={label}>
      <defs>
        <linearGradient id="lavash" x1="0" x2="1">
          <stop offset="0" stopColor="#9a6528" />
          <stop offset=".22" stopColor="#d99a45" />
          <stop offset=".45" stopColor="#efc78a" />
          <stop offset=".75" stopColor="#cf8f3e" />
          <stop offset="1" stopColor="#7d4f1f" />
        </linearGradient>
        <radialGradient id="lavashInner" cx=".5" cy=".6" r=".6">
          <stop offset="0" stopColor="#5a3517" />
          <stop offset="1" stopColor="#b97a2c" />
        </radialGradient>
        <linearGradient id="paper" x1="0" x2="1">
          <stop offset="0" stopColor="#5e3f22" />
          <stop offset=".2" stopColor="#a8794a" />
          <stop offset=".42" stopColor="#d6ad78" />
          <stop offset=".7" stopColor="#a8784a" />
          <stop offset="1" stopColor="#4f3419" />
        </linearGradient>
        <radialGradient id="meat" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#c0703a" />
          <stop offset=".55" stopColor="#8a4220" />
          <stop offset="1" stopColor="#4f2410" />
        </radialGradient>
        <radialGradient id="tomato" cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor="#ef6a4c" />
          <stop offset="1" stopColor="#a7301c" />
        </radialGradient>
        <linearGradient id="shine" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="bodyClip">
          <path d="M68 150 A112 30 0 0 0 292 150 C292 230 286 290 278 330 L286 300 L262 540 Q258 566 180 566 Q102 566 98 540 L74 300 L82 330 C74 290 68 230 68 150Z" />
        </clipPath>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Тень */}
      <ellipse cx="180" cy="580" rx="110" ry="14" fill="#000" opacity=".45" filter="url(#soft)" />

      {/* Внутренняя сторона лаваша */}
      <ellipse cx="180" cy="150" rx="112" ry="30" fill="url(#lavashInner)" />

      {/* Начинка */}
      <g>
        {/* салат */}
        <path d="M74 140c6-26 22-22 30-34s22-12 30-4 18-20 34-12 22-8 32 2 26-4 32 10 20 10 22 34" fill="#7f9a3a" />
        <path d="M84 132c10-14 20-8 28-20s20-4 28 2 16-14 30-6 20 0 28 6 22 0 26 12 14 8 16 16" fill="none" stroke="#a6bf55" strokeWidth="5" strokeLinecap="round" />
        {/* мясо */}
        <path d="M96 132c-4-22 12-36 30-32 14-14 34-10 42 2 14-10 34-6 40 8 18-4 32 8 30 26-30 10-112 10-142-4Z" fill="url(#meat)" />
        <ellipse cx="128" cy="104" rx="20" ry="13" fill="url(#meat)" transform="rotate(-14 128 104)" />
        <ellipse cx="196" cy="98" rx="22" ry="14" fill="url(#meat)" transform="rotate(10 196 98)" />
        <ellipse cx="162" cy="86" rx="18" ry="12" fill="url(#meat)" />
        <ellipse cx="234" cy="114" rx="16" ry="11" fill="url(#meat)" transform="rotate(22 234 114)" />
        <path d="M118 100c6-3 12-3 18 0M188 92c6-3 12-3 18 1M156 82c5-2 10-2 14 0" stroke="#e39a5c" strokeWidth="2.5" strokeLinecap="round" opacity=".7" />
        {/* помидоры */}
        <circle cx="146" cy="118" r="15" fill="url(#tomato)" />
        <circle cx="146" cy="118" r="9" fill="none" stroke="#f9b19b" strokeWidth="1.5" opacity=".7" />
        <circle cx="222" cy="128" r="13" fill="url(#tomato)" />
        <circle cx="222" cy="128" r="7.5" fill="none" stroke="#f9b19b" strokeWidth="1.5" opacity=".7" />
        <circle cx="104" cy="122" r="11" fill="url(#tomato)" />
        {/* огурцы */}
        <ellipse cx="182" cy="118" rx="13" ry="9" fill="#4f6b2a" />
        <ellipse cx="182" cy="118" rx="10" ry="6.5" fill="#c7d98a" />
        <ellipse cx="254" cy="134" rx="11" ry="8" fill="#4f6b2a" />
        <ellipse cx="254" cy="134" rx="8" ry="5.5" fill="#c7d98a" />
        {/* лук */}
        <path d="M118 116c8-10 22-10 28 0" stroke="#d9b3d9" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M200 112c8-9 20-9 26 0" stroke="#d9b3d9" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        {/* соус */}
        <path d="M92 136c14-10 22 6 36-4s22 8 36-2 20 8 34-2 22 6 34-2 20 4 28 0" fill="none" stroke="#fff6e6" strokeWidth="6" strokeLinecap="round" />
        <path d="M110 140c2 8 6 12 4 18M210 140c1 6 4 10 2 16" stroke="#fff6e6" strokeWidth="5" strokeLinecap="round" />
        {/* зелень */}
        {[[134, 90], [176, 100], [214, 104], [110, 112], [246, 120]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="#5f8a2e" />
        ))}
      </g>

      {/* Лаваш (лицевая сторона) */}
      <path d="M68 150 A112 30 0 0 0 292 150 C292 230 286 290 278 330 L82 330 C74 290 68 230 68 150Z" fill="url(#lavash)" />
      <path d="M70 152 A110 28 0 0 0 290 152" fill="none" stroke="#f6d9a6" strokeWidth="3" opacity=".8" />
      {/* Подпалины от гриля */}
      <g fill="#7a4313" opacity=".55">
        <ellipse cx="112" cy="214" rx="14" ry="6" transform="rotate(-8 112 214)" />
        <ellipse cx="172" cy="236" rx="18" ry="6" transform="rotate(-6 172 236)" />
        <ellipse cx="236" cy="210" rx="12" ry="5" transform="rotate(-10 236 210)" />
        <ellipse cx="140" cy="276" rx="16" ry="5" transform="rotate(-5 140 276)" />
        <ellipse cx="214" cy="270" rx="15" ry="5" transform="rotate(-7 214 270)" />
        <ellipse cx="96" cy="262" rx="8" ry="4" />
        <ellipse cx="258" cy="252" rx="8" ry="4" />
      </g>
      <g fill="#5a300d" opacity=".35">
        <circle cx="128" cy="236" r="3" /><circle cx="198" cy="214" r="2.5" /><circle cx="246" cy="236" r="2" /><circle cx="160" cy="296" r="2.5" />
      </g>

      {/* Крафтовая обёртка */}
      <path d={`M${teeth.join(" L")} L262 540 Q258 566 180 566 Q102 566 98 540 Z`} fill="url(#paper)" />
      <g stroke="#3e2914" strokeOpacity=".25" strokeWidth="1.4" fill="none">
        <path d="M120 312 L128 556" /><path d="M160 314 L162 562" /><path d="M204 312 L200 562" /><path d="M246 310 L236 554" />
      </g>
      <path d="M80 340 L280 340" stroke="#f4e6ce" strokeOpacity=".22" strokeWidth="2" />
      {/* Фирменная печать */}
      <g transform="translate(180 446)">
        <circle r="50" fill="none" stroke="#f4e6ce" strokeOpacity=".55" strokeWidth="2" />
        <circle r="42" fill="none" stroke="#f4e6ce" strokeOpacity=".35" strokeWidth="1" strokeDasharray="2 4" />
        <path d="M-12 -6 L0 -20 L12 -6 L6 -6 L6 8 L-6 8 L-6 -6Z" fill="#f4e6ce" fillOpacity=".55" />
        <text y="26" textAnchor="middle" fontSize="11" fontWeight="800" letterSpacing="2.5" fill="#f4e6ce" fillOpacity=".7" fontFamily="var(--font-unbounded), sans-serif">
          {label.toUpperCase()}
        </text>
      </g>

      {/* Подвижный блик (реагирует на поворот) */}
      <g clipPath="url(#bodyClip)">
        <motion.rect x={shineX} y="120" width="70" height="460" fill="url(#shine)" style={{ opacity: shineOpacity }} />
      </g>
    </svg>
  );
}
