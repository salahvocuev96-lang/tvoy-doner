import { StarIcon } from "./Icons";

export function Stars({ value, size = 16, className = "" }: { value: number; size?: number; className?: string }) {
  return (
    <span className={`inline-flex gap-0.5 text-gold ${className}`} aria-label={`Оценка ${value} из 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} width={size} height={size} filled={i <= Math.round(value)} className={i <= Math.round(value) ? "" : "text-cream/25"} />
      ))}
    </span>
  );
}
