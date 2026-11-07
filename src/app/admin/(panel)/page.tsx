import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/format";
import { isTelegramConfigured } from "@/lib/telegram";
import { Card, OrderStatusBadge, PageTitle } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/ActionButton";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { resendFailedNotifications } from "../actions";
import type { OrderRow } from "@/types";

interface Stats {
  orders_total: number;
  orders_today: number;
  orders_active: number;
  notify_failed: number;
  revenue_total: number;
  revenue_today: number;
  revenue_month: number;
  reviews_total: number;
  reviews_pending: number;
  reviews_published: number;
  rating_average: number;
  popular: { name: string; quantity: number; revenue: number }[];
}

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();
  const [{ data: stats, error }, { data: recent }] = await Promise.all([
    supabase.rpc("admin_dashboard_stats"),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(6),
  ]);

  if (error || !stats) {
    return <p className="text-terracotta-400">Не удалось загрузить статистику: {error?.message}</p>;
  }
  const s = stats as Stats;
  const tiles = [
    { label: "Выручка сегодня", value: formatPrice(s.revenue_today), accent: true },
    { label: "Выручка за месяц", value: formatPrice(s.revenue_month) },
    { label: "Выручка всего", value: formatPrice(s.revenue_total) },
    { label: "Заказов сегодня", value: s.orders_today },
    { label: "Заказов всего", value: s.orders_total },
    { label: "Активных заказов", value: s.orders_active },
    { label: "Отзывов", value: `${s.reviews_published} / ${s.reviews_total}`, hint: "опубликовано / всего" },
    { label: "Средний рейтинг", value: s.rating_average ? String(s.rating_average).replace(".", ",") : "—" },
  ];

  return (
    <>
      <AutoRefresh seconds={45} />
      <PageTitle title="Обзор" />

      {(s.notify_failed > 0 || !isTelegramConfigured()) && (
        <Card className="mb-6 border-terracotta/40 bg-terracotta/10">
          {!isTelegramConfigured() ? (
            <p className="text-sm">Telegram-уведомления не настроены. Заказы сохраняются и видны здесь. Инструкция — в README.</p>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm">Не доставлено уведомлений в Telegram: <b>{s.notify_failed}</b>. Заказы сохранены.</p>
              <ActionButton action={resendFailedNotifications} variant="primary">Отправить повторно</ActionButton>
            </div>
          )}
        </Card>
      )}
      {s.reviews_pending > 0 && (
        <Link href="/admin/reviews" className="mb-6 block rounded-2xl border border-gold/30 bg-gold/10 px-5 py-3 text-sm font-semibold text-gold">
          Новых отзывов на модерации: {s.reviews_pending} →
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className={t.accent ? "border-gold/40 bg-gold/10" : ""}>
            <p className="text-xs font-semibold uppercase tracking-wider text-cream/50">{t.label}</p>
            <p className={`mt-2 font-display text-xl font-bold sm:text-2xl ${t.accent ? "text-gold" : ""}`}>{t.value}</p>
            {t.hint && <p className="mt-1 text-[11px] text-cream/35">{t.hint}</p>}
          </Card>
        ))}
      </div>
      <p className="mt-2 text-xs text-cream/35">Выручка считается по оплаченным заказам (выполненный заказ отмечается оплаченным автоматически), без отменённых. Время — московское.</p>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="font-bold">Популярные блюда</h2>
          {s.popular.length === 0 ? (
            <p className="mt-3 text-sm text-cream/50">Пока нет данных.</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {s.popular.map((p, i) => (
                <li key={p.name} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-3"><span className="grid size-7 place-items-center rounded-full bg-gold/15 text-xs font-bold text-gold">{i + 1}</span>{p.name}</span>
                  <span className="text-cream/60">{p.quantity} шт · {formatPrice(p.revenue)}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Последние заказы</h2>
            <Link href="/admin/orders" className="text-sm text-gold">Все →</Link>
          </div>
          <ul className="mt-4 divide-y divide-cream/10">
            {(recent as OrderRow[] | null)?.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:text-gold">
                  <span>
                    <b>{o.order_number}</b> <span className="text-cream/50">· {o.customer_name}</span>
                    <span className="block text-xs text-cream/40">{formatDate(o.created_at, true)}</span>
                  </span>
                  <span className="flex items-center gap-3">{formatPrice(o.total)} <OrderStatusBadge status={o.status} /></span>
                </Link>
              </li>
            ))}
            {!recent?.length && <li className="py-3 text-sm text-cream/50">Заказов пока нет.</li>}
          </ul>
        </Card>
      </div>
    </>
  );
}
