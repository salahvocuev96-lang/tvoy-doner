const WORDS = ["Горячая шаурма", "Свежие ингредиенты", "Выпечка", "Напитки", "Самовывоз", "Ежедневно 10:00–23:00"];

export function Marquee() {
  const row = [...WORDS, ...WORDS];
  return (
    <div className="relative -rotate-1 overflow-hidden border-y border-gold/20 bg-gold py-4 text-coffee" aria-hidden>
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-display text-lg font-extrabold uppercase tracking-tight sm:text-2xl">
        {[...row, ...row].map((w, i) => (
          <span key={i} className="flex items-center gap-10">
            {w}
            <svg viewBox="0 0 20 20" className="size-4 text-terracotta"><path d="M10 0l2.6 7.4L20 10l-7.4 2.6L10 20l-2.6-7.4L0 10l7.4-2.6Z" fill="currentColor" /></svg>
          </span>
        ))}
      </div>
    </div>
  );
}
