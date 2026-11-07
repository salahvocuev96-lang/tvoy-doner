/** Ингредиенты, которые парят вокруг шаурмы. */
export const ingredientArt = {
  tomato: (
    <svg viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r="28" fill="#c8412b" />
      <circle cx="32" cy="32" r="23" fill="#e65a3d" />
      <g fill="#f7c19f">
        <path d="M32 32 L32 12 A20 20 0 0 1 49 22Z" opacity=".55" /><path d="M32 32 L49 42 A20 20 0 0 1 32 52Z" opacity=".55" /><path d="M32 32 L15 42 A20 20 0 0 1 15 22Z" opacity=".55" />
      </g>
      <g fill="#fbe4b8">{[[38, 18], [44, 30], [38, 46], [22, 40], [22, 26]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="2.4" ry="1.6" />)}</g>
      <circle cx="32" cy="32" r="4" fill="#f9b19b" />
    </svg>
  ),
  cucumber: (
    <svg viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r="27" fill="#3f5a22" />
      <circle cx="32" cy="32" r="23" fill="#b9cf7a" />
      <circle cx="32" cy="32" r="13" fill="#d8e6a6" />
      <g fill="#8fa652">{[0, 60, 120, 180, 240, 300].map((a) => <ellipse key={a} cx="32" cy="23" rx="2" ry="3.5" transform={`rotate(${a} 32 32)`} />)}</g>
    </svg>
  ),
  onion: (
    <svg viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r="26" fill="none" stroke="#b880b8" strokeWidth="5" />
      <circle cx="32" cy="32" r="18" fill="none" stroke="#e6c8e6" strokeWidth="4" />
      <circle cx="32" cy="32" r="11" fill="none" stroke="#f3e2f3" strokeWidth="3" />
    </svg>
  ),
  chili: (
    <svg viewBox="0 0 80 40" aria-hidden>
      <path d="M8 22c10-14 40-16 58-6 4 2 4 6 0 8-18 10-46 12-58-2Z" fill="#b8321d" />
      <path d="M16 20c14-6 30-6 44-2" stroke="#ef7a5d" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".7" />
      <path d="M66 16c4-4 8-6 12-4" stroke="#667344" strokeWidth="5" strokeLinecap="round" fill="none" />
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 64 64" aria-hidden>
      <path d="M8 56C8 26 26 8 58 6c0 32-20 50-50 50Z" fill="#6f8d33" />
      <path d="M10 54C24 40 36 28 54 10" stroke="#a6bf55" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M22 42l-6-12M30 34l-2-14M38 26l4-10M26 40l12 2M34 32l12 0" stroke="#a6bf55" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  meat: (
    <svg viewBox="0 0 64 48" aria-hidden>
      <path d="M6 28C4 14 18 6 32 8s28 6 26 20-18 16-30 14S8 40 6 28Z" fill="#8a4220" />
      <path d="M10 26c4-10 16-14 26-12" stroke="#c0703a" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M20 34c8 2 18 0 26-6" stroke="#4f2410" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".7" />
    </svg>
  ),
  sesame: (
    <svg viewBox="0 0 40 40" aria-hidden>
      <g fill="#f4e6ce">{[[10, 12, 20], [24, 8, -30], [30, 24, 60], [14, 28, -10], [22, 18, 40]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx="2.6" ry="4.4" transform={`rotate(${r} ${x} ${y})`} />)}</g>
    </svg>
  ),
} as const;

export type IngredientKind = keyof typeof ingredientArt;
