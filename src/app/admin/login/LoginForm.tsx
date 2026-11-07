"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const ERRORS: Record<string, string> = {
  forbidden: "У этой учётной записи нет прав администратора.",
  config: "Supabase не настроен: заполните переменные окружения (см. README).",
};

export function LoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const errorParam = params.get("error") ?? "";
  const [error, setError] = useState<string | null>(ERRORS[errorParam] ?? null);
  // Сервер может вернуть на эту же страницу с ?error=… — обновляем состояние формы.
  const [seenParam, setSeenParam] = useState(errorParam);
  if (errorParam !== seenParam) {
    setSeenParam(errorParam);
    setError(ERRORS[errorParam] ?? null);
    setLoading(false);
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) return setError(ERRORS.config);
    setLoading(true);
    setError(null);
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setError(error.message === "Invalid login credentials" ? "Неверный email или пароль" : "Не удалось войти. Попробуйте позже.");
      setLoading(false);
      return;
    }
    // Полная загрузка: сбрасывает клиентский кэш маршрутов после смены пользователя.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/admin");
  };

  const field = "w-full rounded-2xl border border-cream/12 bg-coffee/80 px-4 py-3.5 text-cream placeholder:text-cream/30 focus:border-gold focus:outline-none";

  return (
    <form onSubmit={submit} className="relative w-full max-w-sm rounded-[32px] border border-cream/10 bg-coffee-800/80 p-8 shadow-2xl backdrop-blur">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">Админ-панель</p>
      <h1 className="mt-2 font-display text-2xl font-bold">Вход для владельца</h1>
      <div className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm text-cream/70">Email</span>
          <input type="email" name="email" required autoComplete="username" className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-cream/70">Пароль</span>
          <input type="password" name="password" required autoComplete="current-password" className={field} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
      </div>
      {error && <p className="mt-4 rounded-xl bg-terracotta/15 px-4 py-2.5 text-sm text-terracotta-400" role="alert">{error}</p>}
      <button type="submit" disabled={loading} className="mt-6 w-full rounded-full bg-gold py-4 font-bold text-coffee transition-colors hover:bg-gold-300 disabled:opacity-60">
        {loading ? "Входим…" : "Войти"}
      </button>
    </form>
  );
}
