import type { StoreSettings } from "@/types";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ClockIcon, PhoneIcon, PinIcon, RouteIcon } from "@/components/ui/Icons";
import { telHref } from "@/lib/format";

export function mapLinks(address: string) {
  const q = encodeURIComponent(address);
  return {
    yandex: `https://yandex.ru/maps/?text=${q}`,
    route: `https://yandex.ru/maps/?mode=routes&rtext=~${q}`,
    twoGis: `https://2gis.ru/moscow/search/${q}`,
    google: `https://www.google.com/maps/search/?api=1&query=${q}`,
  };
}

export function Contacts({ settings }: { settings: StoreSettings }) {
  const links = mapLinks(settings.address);
  return (
    <section id="contacts" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow="Контакты" title={<>Ждём вас <span className="text-gold">в гости</span></>} />

        <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <Reveal className="flex flex-col gap-4">
            <div className="rounded-[32px] border border-cream/10 bg-coffee-800/60 p-7">
              <PinIcon className="text-gold" width={26} height={26} />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-cream/45">Адрес</p>
              <p className="mt-1 font-display text-xl font-bold leading-snug">{settings.address}</p>
              {(settings.addressNote || settings.postalCode) && (
                <p className="mt-1 text-cream/55">{[settings.addressNote, settings.postalCode].filter(Boolean).join(" · ")}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <a href={telHref(settings.phone)} className="group rounded-[32px] border border-cream/10 bg-coffee-800/60 p-7 transition-colors hover:border-gold/40">
                <PhoneIcon className="text-gold" width={26} height={26} />
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-cream/45">Телефон</p>
                <p className="mt-1 whitespace-nowrap font-display text-base font-bold transition-colors group-hover:text-gold xl:text-lg">{settings.phone}</p>
              </a>
              <div className="rounded-[32px] border border-cream/10 bg-coffee-800/60 p-7">
                <ClockIcon className="text-gold" width={26} height={26} />
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-cream/45">График</p>
                <p className="mt-1 font-display text-lg font-bold">{settings.hoursText}</p>
              </div>
            </div>
            <div className="rounded-[32px] bg-olive/20 p-7">
              <p className="font-bold">Только самовывоз</p>
              <p className="mt-1 text-sm leading-relaxed text-cream/65">Оформите заказ на сайте — мы получим его сразу. Назовите номер заказа на месте и оплатите наличными или картой.</p>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="relative min-h-[380px] overflow-hidden rounded-[32px] border border-cream/10 bg-[#2a1e17]">
            {/* Стилизованная схема — без сторонних скриптов и трекеров */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid slice" aria-hidden>
              <defs>
                <pattern id="blocks" width="60" height="60" patternUnits="userSpaceOnUse">
                  <rect x="6" y="6" width="48" height="48" rx="8" fill="#36271e" />
                </pattern>
              </defs>
              <rect width="600" height="500" fill="url(#blocks)" />
              <path d="M-20 330 C 150 300, 300 360, 620 250" stroke="#4a372b" strokeWidth="38" fill="none" />
              <path d="M-20 330 C 150 300, 300 360, 620 250" stroke="#d99a45" strokeOpacity=".35" strokeWidth="2" strokeDasharray="10 12" fill="none" />
              <path d="M250 -20 C 270 150, 230 300, 290 520" stroke="#4a372b" strokeWidth="26" fill="none" />
              <path d="M430 -20 L 470 520" stroke="#4a372b" strokeWidth="18" fill="none" />
              <ellipse cx="120" cy="120" rx="90" ry="60" fill="#667344" opacity=".35" />
            </svg>
            <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-full">
              <span className="absolute left-1/2 top-full size-24 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-gold/20" />
              <div className="relative flex flex-col items-center">
                <div className="rounded-2xl bg-gold px-4 py-2 font-display text-sm font-extrabold text-coffee shadow-xl">{settings.name}</div>
                <div className="h-6 w-0.5 bg-gold" />
                <div className="size-3 rounded-full bg-gold ring-4 ring-gold/30" />
              </div>
            </div>
            <div className="absolute inset-x-4 bottom-4 flex flex-col gap-2 sm:flex-row">
              <a href={links.route} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold py-3.5 font-bold text-coffee transition-colors hover:bg-gold-300">
                <RouteIcon /> Построить маршрут
              </a>
              <div className="flex gap-2">
                <a href={links.yandex} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-full bg-coffee-900/85 px-5 py-3.5 text-center text-sm font-bold backdrop-blur transition-colors hover:text-gold">Яндекс</a>
                <a href={links.twoGis} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-full bg-coffee-900/85 px-5 py-3.5 text-center text-sm font-bold backdrop-blur transition-colors hover:text-gold">2ГИС</a>
                <a href={links.google} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-full bg-coffee-900/85 px-5 py-3.5 text-center text-sm font-bold backdrop-blur transition-colors hover:text-gold">Google</a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
