import Image from "next/image";

/**
 * Фото товара. Если image_url не задан — показывается фирменный placeholder
 * с иллюстрацией категории. Фото загружаются через админку (Supabase Storage),
 * компоненты менять не нужно.
 */
export function ProductImage({
  src,
  alt,
  category,
  sizes = "(max-width: 640px) 90vw, 360px",
  priority = false,
  className = "",
}: {
  src: string | null;
  alt: string;
  category?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  return (
    <div
      className={`relative isolate overflow-hidden bg-[radial-gradient(120%_90%_at_50%_15%,#4a372b_0%,#2a1e17_55%,#1c130f_100%)] ${className}`}
      role="img"
      aria-label={`${alt} — фото скоро появится`}
    >
      <div className="pattern-girih absolute inset-0 opacity-[0.09]" />
      <div className="absolute left-1/2 top-[42%] size-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-2xl" />
      <CategoryArt slug={category} className="absolute left-1/2 top-[46%] h-[52%] w-auto -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_18px_24px_rgba(0,0,0,.45)]" />
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-cream/10 bg-coffee/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/45 backdrop-blur">
        фото скоро
      </span>
    </div>
  );
}

function CategoryArt({ slug, className }: { slug?: string; className?: string }) {
  const common = { className, viewBox: "0 0 120 120", "aria-hidden": true } as const;
  switch (slug) {
    case "drinks":
      return (
        <svg {...common}>
          <path d="M38 30h44l-6 74a6 6 0 0 1-6 5H50a6 6 0 0 1-6-5l-6-74Z" fill="#a94327" />
          <path d="M40 46h40l-1.5 18H41.5L40 46Z" fill="#f4e6ce" />
          <rect x="34" y="24" width="52" height="9" rx="4" fill="#f4e6ce" />
          <path d="M66 24 74 6" stroke="#d99a45" strokeWidth="5" strokeLinecap="round" />
          <path d="M46 80h6M48 92h4" stroke="#f4e6ce" strokeOpacity=".4" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case "bakery":
      return (
        <svg {...common}>
          <ellipse cx="60" cy="86" rx="46" ry="10" fill="#000" opacity=".25" />
          <path d="M14 76c0-26 20-44 46-44s46 18 46 44c0 6-6 10-12 10H26c-6 0-12-4-12-10Z" fill="#d99a45" />
          <path d="M24 70c4-18 18-30 36-30s32 12 36 30" fill="none" stroke="#b97a2c" strokeWidth="4" strokeLinecap="round" />
          <path d="M40 46c6 6 8 16 6 30M60 40v36M80 46c-6 6-8 16-6 30" stroke="#8a5a20" strokeWidth="3" strokeLinecap="round" />
          {[30, 48, 66, 84, 56, 74].map((x, i) => (<ellipse key={i} cx={x} cy={i > 3 ? 58 : 66} rx="1.6" ry="1" fill="#f4e6ce" />))}
        </svg>
      );
    case "sides":
      return (
        <svg {...common}>
          {[34, 44, 54, 64, 74, 84].map((x, i) => (
            <rect key={x} x={x - 4} y={14 + (i % 3) * 8} width="8" height="56" rx="2" fill="#e9b872" transform={`rotate(${(i - 2.5) * 5} ${x} 70)`} />
          ))}
          <path d="M26 54h68l-8 56H34l-8-56Z" fill="#a94327" />
          <path d="M26 54h68l-2 12H28l-2-12Z" fill="#c25a3b" />
          <path d="M50 78c0 8 4 14 10 14s10-6 10-14" fill="none" stroke="#f4e6ce" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case "extras":
      return (
        <svg {...common}>
          <ellipse cx="60" cy="74" rx="40" ry="22" fill="#f4e6ce" />
          <ellipse cx="60" cy="68" rx="34" ry="14" fill="#ead8b8" />
          <path d="M34 66c8-12 44-12 52 0-6 6-46 6-52 0Z" fill="#fff8ec" />
          <circle cx="50" cy="64" r="2" fill="#667344" /><circle cx="66" cy="62" r="2" fill="#667344" /><circle cx="72" cy="67" r="1.6" fill="#a94327" />
          <path d="M84 28c10 6 12 18 6 28" stroke="#667344" strokeWidth="5" strokeLinecap="round" fill="none" />
          <ellipse cx="80" cy="26" rx="8" ry="4" fill="#8a9862" transform="rotate(-30 80 26)" />
        </svg>
      );
    case "combo":
      return (
        <svg {...common}>
          <rect x="12" y="62" width="96" height="40" rx="8" fill="#a94327" />
          <path d="M28 64 40 20c2-6 12-6 14 0l10 44Z" fill="#e9b872" />
          <path d="M30 56h32" stroke="#b97a2c" strokeWidth="10" />
          <rect x="72" y="34" width="22" height="32" rx="4" fill="#f4e6ce" />
          <path d="M86 34 90 18" stroke="#d99a45" strokeWidth="4" strokeLinecap="round" />
          <path d="M22 80h76" stroke="#f4e6ce" strokeOpacity=".35" strokeWidth="3" strokeDasharray="4 6" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M40 112 26 34c-1-6 4-11 10-11h48c6 0 11 5 10 11l-14 78Z" fill="#e9b872" />
          <path d="M33 62 87 62 80 112H40Z" fill="#c9a06a" />
          <path d="M33 62h54" stroke="#8a5a20" strokeWidth="2" />
          <path d="M36 70h48M38 80h44" stroke="#8a5a20" strokeOpacity=".35" strokeWidth="1.5" />
          <circle cx="44" cy="22" r="10" fill="#7a3b1e" /><circle cx="62" cy="16" r="11" fill="#9c5128" />
          <circle cx="78" cy="24" r="9" fill="#7a3b1e" />
          <path d="M34 28c8-6 14 2 22-4s16 2 24-2 10 2 10 2" stroke="#7f9a3a" strokeWidth="6" strokeLinecap="round" fill="none" />
          <circle cx="52" cy="28" r="5" fill="#c8412b" /><circle cx="72" cy="30" r="4.5" fill="#c8412b" />
          <path d="M48 40c4 4 20 4 24 0" stroke="#fff3df" strokeWidth="4" strokeLinecap="round" fill="none" />
        </svg>
      );
  }
}
