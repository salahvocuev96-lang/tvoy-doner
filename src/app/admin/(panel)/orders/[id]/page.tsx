import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUS_LABELS, PAYMENT_LABELS } from "@/config/site";
import { formatDate, formatPrice, prettyPhone, telHref } from "@/lib/format";
import { Card, OrderStatusBadge } from "@/components/admin/ui";
import { ActionButton } from "@/components/admin/ActionButton";
import { resendOrderNotification, setOrderPaid, updateOrderStatus } from "../../../actions";
import type { OrderItemRow, OrderRow, OrderStatus } from "@/types";

const FLOW: OrderStatus[] = ["new", "accepted", "preparing", "ready", "completed"];
const NOTIFY_LABELS = { pending: "ожидает отправки", sent: "отправлено", failed: "ошибка отправки", disabled: "Telegram не настроен" };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [{ data: order }, { data: items }, { data: history }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle<OrderRow>(),
    supabase.from("order_items").select("*").eq("order_id", id),
    supabase.from("order_status_history").select("status, created_at").eq("order_id", id).order("created_at"),
  ]);
  if (!order) notFound();

  const idx = FLOW.indexOf(order.status);
  const next = idx >= 0 && idx < FLOW.length - 1 ? FLOW[idx + 1] : null;

  return (
    <>
      <Link href="/admin/orders" className="text-sm text-cream/50 hover:text-gold">← Все заказы</Link>
      <div className="mb-6 mt-3 flex flex-wrap items-center gap-4">
        <h1 className="font-display text-3xl font-bold">{order.order_number}</h1>
        <OrderStatusBadge status={order.status} />
        {order.is_paid && <span className="rounded-full bg-olive/30 px-3 py-1 text-xs font-bold text-olive-300">Оплачен</span>}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <Card>
            <h2 className="font-bold">Состав заказа</h2>
            <ul className="mt-4 divide-y divide-cream/10">
              {(items as OrderItemRow[] | null)?.map((i) => (
                <li key={i.id} className="flex justify-between gap-4 py-3 text-sm">
                  <span>
                    <b>{i.product_name}</b> × {i.quantity}
                    {i.options.length > 0 && <span className="block text-xs text-cream/50">+ {i.options.map((o) => `${o.name} (${formatPrice(o.price)})`).join(", ")}</span>}
                    <span className="block text-xs text-cream/40">{formatPrice(i.unit_price + i.options_price)} за шт.</span>
                  </span>
                  <span className="font-bold">{formatPrice(i.line_total)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-cream/10 pt-4">
              <span className="font-bold">Итого</span>
              <span className="font-display text-xl font-bold text-gold">{formatPrice(order.total)}</span>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 font-bold">Статус</h2>
            <div className="flex flex-wrap gap-2">
              {next && order.status !== "cancelled" && (
                <ActionButton variant="primary" action={updateOrderStatus.bind(null, order.id, next)}>
                  → {ORDER_STATUS_LABELS[next]}
                </ActionButton>
              )}
              {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[])
                .filter((s) => s !== order.status && s !== next && s !== "cancelled")
                .map((s) => (
                  <ActionButton key={s} action={updateOrderStatus.bind(null, order.id, s)}>{ORDER_STATUS_LABELS[s]}</ActionButton>
                ))}
              {order.status !== "cancelled" && (
                <ActionButton variant="danger" confirm="Отменить заказ?" action={updateOrderStatus.bind(null, order.id, "cancelled")}>Отменить</ActionButton>
              )}
            </div>
            {order.status !== "cancelled" && (
              <div className="mt-4 border-t border-cream/10 pt-4">
                <ActionButton action={setOrderPaid.bind(null, order.id, !order.is_paid)}>
                  {order.is_paid ? "Снять отметку «оплачен»" : "Отметить оплаченным"}
                </ActionButton>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <h2 className="font-bold">Клиент</h2>
            <p className="mt-3">{order.customer_name}</p>
            <a href={telHref(order.customer_phone)} className="mt-1 block font-bold text-gold">{prettyPhone(order.customer_phone)}</a>
            {order.comment && <p className="mt-3 whitespace-pre-line rounded-xl bg-coffee-900/60 p-3 text-sm text-cream/80">{order.comment}</p>}
            <dl className="mt-4 space-y-1 text-sm text-cream/60">
              <div>Получение: самовывоз</div>
              <div>Оплата: {PAYMENT_LABELS[order.payment_method]}</div>
              <div>Создан: {formatDate(order.created_at, true)}</div>
            </dl>
          </Card>

          <Card>
            <h2 className="font-bold">Telegram</h2>
            <p className={`mt-2 text-sm ${order.notify_status === "sent" ? "text-olive-300" : "text-terracotta-400"}`}>
              {NOTIFY_LABELS[order.notify_status]}
              {order.notify_attempts > 0 && ` · попыток: ${order.notify_attempts}`}
            </p>
            {order.notify_error && order.notify_status !== "sent" && <p className="mt-1 text-xs text-cream/40">{order.notify_error}</p>}
            <div className="mt-3">
              <ActionButton action={resendOrderNotification.bind(null, order.id)}>Отправить ещё раз</ActionButton>
            </div>
          </Card>

          <Card>
            <h2 className="font-bold">История</h2>
            <ol className="mt-3 space-y-2 border-l border-cream/15 pl-4 text-sm">
              {history?.map((h, i) => (
                <li key={i}>
                  <span className="font-semibold">{ORDER_STATUS_LABELS[h.status as OrderStatus]}</span>
                  <span className="block text-xs text-cream/45">{formatDate(h.created_at as string, true)}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}
