import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUS_LABELS, PAYMENT_LABELS } from "@/config/site";
import { formatDate, formatPrice, prettyPhone } from "@/lib/format";
import { Card, OrderStatusBadge, PageTitle } from "@/components/admin/ui";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import type { OrderRow, OrderStatus } from "@/types";

const PAGE_SIZE = 30;
const FILTERS: { key: string; label: string; statuses?: OrderStatus[] }[] = [
  { key: "active", label: "Активные", statuses: ["new", "accepted", "preparing", "ready"] },
  { key: "all", label: "Все" },
  ...(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => ({ key: s, label: ORDER_STATUS_LABELS[s], statuses: [s] })),
];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ filter?: string; page?: string; q?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const filter = FILTERS.find((f) => f.key === sp.filter) ?? FILTERS[0];
  const page = Math.max(1, Number(sp.page) || 1);
  const q = (sp.q ?? "").trim().slice(0, 40);

  let query = supabase.from("orders").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (filter.statuses) query = query.in("status", filter.statuses);
  if (q) {
    const digits = q.replace(/\D/g, "");
    const safe = q.replace(/[%,()]/g, "");
    query = query.or(
      [`order_number.ilike.%${safe}%`, `customer_name.ilike.%${safe}%`, digits.length >= 3 ? `customer_phone.ilike.%${digits}%` : null].filter(Boolean).join(","),
    );
  }
  const { data, count, error } = await query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const orders = (data ?? []) as OrderRow[];
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const href = (p: Record<string, string | number>) => `/admin/orders?${new URLSearchParams({ filter: filter.key, ...(q ? { q } : {}), ...Object.fromEntries(Object.entries(p).map(([k, v]) => [k, String(v)])) })}`;

  return (
    <>
      <AutoRefresh seconds={30} />
      <PageTitle title="Заказы">
        <form className="flex gap-2" action="/admin/orders">
          <input type="hidden" name="filter" value={filter.key} />
          <input name="q" defaultValue={q} placeholder="Номер, имя, телефон" className="w-48 rounded-xl border border-cream/12 bg-coffee-900/70 px-3.5 py-2 text-sm focus:border-gold focus:outline-none sm:w-60" />
        </form>
      </PageTitle>

      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4">
        {FILTERS.map((f) => (
          <Link key={f.key} href={`/admin/orders?filter=${f.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${f.key === filter.key ? "bg-cream text-coffee" : "border border-cream/15 text-cream/70"}`}>
            {f.label}
          </Link>
        ))}
      </div>

      {error && <p className="text-terracotta-400">Ошибка загрузки: {error.message}</p>}

      {orders.length === 0 ? (
        <Card><p className="text-cream/50">Заказов нет.</p></Card>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="block rounded-2xl border border-cream/10 bg-coffee-800/70 p-4 transition-colors hover:border-gold/40">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold">
                    {o.order_number} <span className="font-normal text-cream/60">· {o.customer_name}</span>
                  </p>
                  <p className="text-xs text-cream/45">
                    {formatDate(o.created_at, true)} · {prettyPhone(o.customer_phone)} · {PAYMENT_LABELS[o.payment_method]}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {o.notify_status === "failed" && <span className="text-xs text-terracotta-400" title={o.notify_error ?? ""}>TG ✕</span>}
                  {o.is_paid && <span className="text-xs text-olive-300">оплачен</span>}
                  <span className="font-display font-bold">{formatPrice(o.total)}</span>
                  <OrderStatusBadge status={o.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          {page > 1 && <Link href={href({ page: page - 1 })} className="rounded-xl border border-cream/15 px-4 py-2">← Назад</Link>}
          <span className="text-cream/50">Стр. {page} из {pages}</span>
          {page < pages && <Link href={href({ page: page + 1 })} className="rounded-xl border border-cream/15 px-4 py-2">Вперёд →</Link>}
        </div>
      )}
    </>
  );
}
