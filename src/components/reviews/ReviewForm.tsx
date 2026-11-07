"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { StarIcon } from "@/components/ui/Icons";

const field =
  "w-full rounded-2xl border border-cream/12 bg-coffee-900/60 px-4 py-3.5 text-cream placeholder:text-cream/30 transition-colors focus:border-gold focus:outline-none";

export function ReviewForm() {
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    setError(null);
    if (name.trim().length < 2) return setError("Введите имя");
    if (!rating) return setError("Поставьте оценку");
    if (body.trim().length < 10) return setError("Напишите хотя бы пару слов (от 10 символов)");
    setState("sending");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName: name, rating, body, website, startedAt: startedAt.current }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Не удалось отправить отзыв");
      setState("done");
    } catch (err) {
      setError(err instanceof Error && err.message !== "Failed to fetch" ? err.message : "Нет связи с сервером");
      setState("idle");
    }
  };

  const shown = hover || rating;

  return (
    <div className="sticky top-28 rounded-[32px] border border-gold/20 bg-gradient-to-b from-coffee-700/60 to-coffee-800/60 p-6 sm:p-7">
      <AnimatePresence mode="wait">
        {state === "done" ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-olive text-2xl">✓</div>
            <p className="mt-5 font-display text-xl font-bold">Спасибо за отзыв!</p>
            <p className="mt-2 text-sm text-cream/60">Он появится на сайте после проверки.</p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} exit={{ opacity: 0 }} className="space-y-4" noValidate>
            <p className="font-display text-xl font-bold">Оставить отзыв</p>
            <div>
              <span className="mb-2 block text-sm font-semibold text-cream/70" id="rating-label">Оценка</span>
              <div className="flex gap-1" role="radiogroup" aria-labelledby="rating-label" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.button
                    key={i}
                    type="button"
                    role="radio"
                    aria-checked={rating === i}
                    aria-label={`${i} из 5`}
                    whileTap={{ scale: 0.8 }}
                    onMouseEnter={() => setHover(i)}
                    onClick={() => setRating(i)}
                    className={`p-1 transition-colors ${i <= shown ? "text-gold" : "text-cream/20"}`}
                  >
                    <StarIcon width={30} height={30} filled={i <= shown} />
                  </motion.button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-cream/70">Имя</span>
              <input className={field} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="given-name" placeholder="Ваше имя" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-cream/70">Отзыв</span>
              <textarea className={`${field} min-h-32 resize-none`} value={body} onChange={(e) => setBody(e.target.value)} maxLength={1000} placeholder="Что понравилось, что улучшить?" />
              <span className="mt-1 block text-right text-xs text-cream/35">{body.length}/1000</span>
            </label>
            {/* Ловушка для ботов — скрыта от людей */}
            <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden />
            {error && <p className="rounded-xl bg-terracotta/15 px-4 py-2.5 text-sm text-terracotta-400" role="alert">{error}</p>}
            <button type="submit" disabled={state === "sending"} className="w-full rounded-full bg-cream py-4 font-bold text-coffee transition-colors hover:bg-gold disabled:opacity-60">
              {state === "sending" ? "Отправляем…" : "Отправить на модерацию"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
