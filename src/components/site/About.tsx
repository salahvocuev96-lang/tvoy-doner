import Image from "next/image";
import { placeImage } from "@/config/media";
import type { StoreSettings } from "@/types";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CardIcon, ClockIcon, PinIcon, BagIcon } from "@/components/ui/Icons";

export function About({ settings }: { settings: StoreSettings }) {
  const facts = [
    { icon: ClockIcon, title: "Каждый день", text: `${settings.openTime}–${settings.closeTime}, без выходных` },
    { icon: BagIcon, title: "Самовывоз", text: "Оформите заказ на сайте и заберите его в заведении" },
    { icon: CardIcon, title: "Оплата на месте", text: "Наличными или картой при получении" },
    { icon: PinIcon, title: settings.addressNote || "Рядом с вами", text: settings.address.replace(/^Москва,\s*/, "") },
  ];

  return (
    <section id="about" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
        <Reveal className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[40px] border border-cream/10 bg-coffee-800 sm:aspect-[5/5]">
            {placeImage ? (
              <Image src={placeImage} alt={`Заведение «${settings.name}»`} fill sizes="(max-width: 1024px) 100vw, 600px" className="object-cover" />
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,#4a372b,#211712_70%)]" role="img" aria-label="Место для фотографии заведения">
                <div className="pattern-girih absolute inset-0 opacity-[0.08]" />
                <div className="relative text-center">
                  <p className="font-display text-[22vw] font-black leading-none text-gold/15 sm:text-[160px]">14</p>
                  <p className="-mt-4 text-xs font-bold uppercase tracking-[0.3em] text-cream/40">Маршала Жукова</p>
                </div>
              </div>
            )}
          </div>
          <div className="absolute -bottom-6 -right-2 rounded-3xl border border-gold/30 bg-coffee-900/90 px-6 py-5 shadow-2xl backdrop-blur sm:-right-6">
            <p className="font-display text-3xl font-extrabold text-gold">{settings.openTime}–{settings.closeTime}</p>
            <p className="text-sm text-cream/60">ежедневно</p>
          </div>
        </Reveal>

        <div>
          <SectionHeading
            eyebrow="О заведении"
            title={<>Уличная еда <span className="text-gold">с характером</span></>}
            text={`«${settings.name}» — небольшая точка уличной еды на проспекте Маршала Жукова. Шаурма, выпечка и напитки — чтобы перекусить по дороге или взять с собой.`}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {facts.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08} className="rounded-3xl border border-cream/[0.08] bg-coffee-800/50 p-5 transition-colors hover:border-gold/30">
                <f.icon className="text-gold" width={24} height={24} />
                <p className="mt-4 font-bold">{f.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-cream/55">{f.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
