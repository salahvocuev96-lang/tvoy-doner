import type { Review, ReviewSummary } from "@/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Stars } from "@/components/ui/Stars";
import { formatDate, pluralize } from "@/lib/format";
import { ReviewForm } from "./ReviewForm";

export function ReviewsSection({ reviews, summary }: { reviews: Review[]; summary: ReviewSummary }) {
  return (
    <section id="reviews" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pattern-girih absolute inset-0 -z-10 opacity-[0.03]" aria-hidden />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading eyebrow="Отзывы" title={<>Что говорят <span className="text-gold">гости</span></>} />
          {summary.count > 0 && (
            <Reveal className="flex items-center gap-5 rounded-[28px] border border-cream/10 bg-coffee-800/60 px-6 py-5">
              <span className="font-display text-5xl font-extrabold text-gold">{summary.average.toFixed(1).replace(".", ",")}</span>
              <span>
                <Stars value={summary.average} size={18} />
                <span className="mt-1 block text-sm text-cream/55">
                  {summary.count} {pluralize(summary.count, ["отзыв", "отзыва", "отзывов"])}
                </span>
              </span>
            </Reveal>
          )}
        </div>

        <div className="mt-12 grid items-start gap-6 lg:grid-cols-[1fr_400px]">
          {reviews.length > 0 ? (
            <div className="columns-1 gap-5 sm:columns-2 [&>*]:mb-5">
              {reviews.map((r, i) => (
                <Reveal key={r.id} delay={Math.min(i, 4) * 0.06} as="article" className="break-inside-avoid rounded-[28px] border border-cream/[0.08] bg-coffee-800/50 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-11 place-items-center rounded-full bg-gold/15 font-display font-bold text-gold">{r.author_name.charAt(0).toUpperCase()}</span>
                      <div>
                        <p className="font-bold">{r.author_name}</p>
                        {r.published_at && <time dateTime={r.published_at} className="text-xs text-cream/40">{formatDate(r.published_at)}</time>}
                      </div>
                    </div>
                    <Stars value={r.rating} size={14} />
                  </div>
                  <p className="mt-4 whitespace-pre-line leading-relaxed text-cream/75">{r.body}</p>
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal className="grid place-items-center rounded-[32px] border border-dashed border-cream/15 p-10 text-center">
              <div>
                <p className="font-display text-2xl font-bold">Здесь появятся ваши отзывы</p>
                <p className="mx-auto mt-3 max-w-sm text-cream/55">Были у нас? Расскажите, как вам — отзыв появится на сайте после проверки.</p>
              </div>
            </Reveal>
          )}
          <Reveal delay={0.1}>
            <ReviewForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
