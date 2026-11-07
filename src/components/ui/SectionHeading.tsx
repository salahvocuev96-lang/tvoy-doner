import { Reveal } from "./Reveal";

export function SectionHeading({ eyebrow, title, text, align = "left" }: { eyebrow: string; title: React.ReactNode; text?: string; align?: "left" | "center" }) {
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className={`mb-4 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-gold ${align === "center" ? "justify-center" : ""}`}>
        <span className="h-px w-8 bg-gold/60" />
        {eyebrow}
      </p>
      <h2 className="text-balance font-display text-3xl font-bold leading-[1.05] tracking-tight text-cream sm:text-5xl">{title}</h2>
      {text && <p className="mt-5 text-base leading-relaxed text-cream/65 sm:text-lg">{text}</p>}
    </Reveal>
  );
}
