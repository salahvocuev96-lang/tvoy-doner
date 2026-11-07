import "server-only";
import { ORDER_STATUS_LABELS, PAYMENT_LABELS } from "@/config/site";
import { createServiceClient } from "@/lib/supabase/service";
import { formatPrice, prettyPhone } from "@/lib/format";
import type { OrderItemRow, OrderRow } from "@/types";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const isTelegramConfigured = () =>
  Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

export function formatOrderMessage(order: OrderRow, items: OrderItemRow[]) {
  const lines = items.map((i) => {
    const opts = i.options.length ? ` (+ ${i.options.map((o) => esc(o.name)).join(", ")})` : "";
    return `${esc(i.product_name)}${opts} × ${i.quantity} — ${formatPrice(i.line_total)}`;
  });
  return [
    "🌯 <b>НОВЫЙ ЗАКАЗ</b>",
    "",
    `Номер: <b>${esc(order.order_number)}</b>`,
    "",
    `Клиент: ${esc(order.customer_name)}`,
    `Телефон: ${esc(prettyPhone(order.customer_phone))}`,
    "",
    "<b>СОСТАВ:</b>",
    "",
    ...lines,
    "",
    `<b>ИТОГО: ${formatPrice(order.total)}</b>`,
    "",
    `Оплата: ${PAYMENT_LABELS[order.payment_method]}`,
    "Получение: Самовывоз",
    ...(order.comment ? ["", `Комментарий: ${esc(order.comment)}`] : []),
    "",
    `Статус: ${ORDER_STATUS_LABELS[order.status]}.`,
  ].join("\n");
}

export async function sendTelegramMessage(text: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { ok: false, error: "Telegram не настроен" };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
      signal: AbortSignal.timeout(7000),
      cache: "no-store",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; description?: string } | null;
    if (!res.ok || !json?.ok) return { ok: false, error: json?.description || `HTTP ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Сетевая ошибка" };
  }
}

/**
 * Отправляет уведомление о заказе и записывает результат в БД.
 * Ошибка Telegram не влияет на сам заказ — он уже сохранён.
 */
export async function notifyOrder(orderId: string) {
  const db = createServiceClient();
  if (!db) return { ok: false as const, error: "Сервер не настроен" };

  const { data: order } = await db.from("orders").select("*").eq("id", orderId).single<OrderRow>();
  if (!order) return { ok: false as const, error: "Заказ не найден" };

  if (!isTelegramConfigured()) {
    await db.from("orders").update({ notify_status: "disabled", notify_error: "Telegram не настроен" }).eq("id", orderId);
    return { ok: false as const, error: "Telegram не настроен" };
  }

  const { data: items } = await db.from("order_items").select("*").eq("order_id", orderId);
  const result = await sendTelegramMessage(formatOrderMessage(order, (items ?? []) as OrderItemRow[]));

  await db
    .from("orders")
    .update(
      result.ok
        ? { notify_status: "sent", notify_error: null, notified_at: new Date().toISOString(), notify_attempts: order.notify_attempts + 1 }
        : { notify_status: "failed", notify_error: result.error.slice(0, 300), notify_attempts: order.notify_attempts + 1 },
    )
    .eq("id", orderId);

  if (!result.ok) console.error(`[telegram] ${order.order_number}: ${result.error}`);
  return result;
}
