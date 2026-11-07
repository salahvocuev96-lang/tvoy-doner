/**
 * Текстовый логотип. Чтобы заменить на настоящий логотип —
 * поменяйте содержимое этого компонента на <Image src="/logo.svg" … />.
 */
export function Wordmark({ name, className = "" }: { name: string; className?: string }) {
  const [first, ...rest] = name.split(" ");
  return (
    <span className={`inline-flex items-baseline gap-1.5 font-display leading-none ${className}`}>
      <span className="text-[0.62em] font-medium uppercase tracking-[0.28em] text-cream/70">{first}</span>
      <span className="font-extrabold uppercase tracking-tight text-gold">{rest.join(" ") || first}</span>
    </span>
  );
}
