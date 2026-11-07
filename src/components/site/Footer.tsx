import type { StoreSettings } from "@/types";
import { Wordmark } from "@/components/ui/Wordmark";
import { telHref } from "@/lib/format";

export function Footer({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="relative overflow-hidden border-t border-cream/10 bg-coffee-900 pt-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark name={settings.name} className="text-3xl" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/50">Шаурма, выпечка и напитки. Самовывоз в Москве.</p>
        </div>
        <nav aria-label="Навигация в подвале" className="flex flex-col gap-2 text-sm text-cream/70">
          {[["#menu", "Меню"], ["#about", "О заведении"], ["#reviews", "Отзывы"], ["#contacts", "Контакты"]].map(([h, l]) => (
            <a key={h} href={h} className="w-fit transition-colors hover:text-gold">{l}</a>
          ))}
        </nav>
        <address className="space-y-2 text-sm not-italic text-cream/70">
          <p>{settings.address}</p>
          <a href={telHref(settings.phone)} className="block font-bold text-gold">{settings.phone}</a>
          <p>{settings.hoursText}</p>
        </address>
      </div>
      <div className="border-t border-cream/10 px-5 py-6 text-center text-xs text-cream/35">
        © {settings.name}, Москва. Все права защищены.
      </div>
      <p className="pointer-events-none -mb-[2vw] select-none whitespace-nowrap text-center font-display text-[11vw] font-black leading-none tracking-tighter text-cream/[0.03]" aria-hidden>
        {settings.name.toUpperCase()}
      </p>
    </footer>
  );
}
