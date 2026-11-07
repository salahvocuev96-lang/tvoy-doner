import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { firstError, orderSchema } from "@/lib/validation";
import { clientKeyHash, isSameOrigin } from "@/lib/request";
import { notifyOrder } from "@/lib/telegram";

const ERRORS: Record<string, string> = {
  STORE_CLOSED: "Сейчас мы закрыты. Оформите заказ в часы работы.",
  ORDERING_DISABLED: "Приём заказов временно приостановлен. Позвоните нам, пожалуйста.",
  PRODUCT_UNAVAILABLE: "Некоторые товары закончились или изменились. Обновите корзину.",
  OPTION_UNAVAILABLE: "Одна из добавок недоступна. Обновите корзину.",
  INVALID_QUANTITY: "Некорректное количество товара.",
  INVALID_ITEMS: "Корзина пуста.",
};

export async function POST(request: Request) {
  if (!(await isSameOrigin())) {
    return NextResponse.json({ error: "Запрос отклонён" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }
  const input = parsed.data;

  const db = createServiceClient();
  if (!db) {
    return NextResponse.json({ error: "Сервер заказов не настроен" }, { status: 503 });
  }

  // Не более 6 заказов за 10 минут с одного адреса.
  const { data: allowed } = await db.rpc("check_rate_limit", {
    p_action: "order",
    p_key_hash: await clientKeyHash(),
    p_max: 6,
    p_window_seconds: 600,
  });
  if (allowed === false) {
    return NextResponse.json({ error: "Слишком много заказов подряд. Попробуйте позже или позвоните нам." }, { status: 429 });
  }

  const { data, error } = await db.rpc("create_order", {
    p_idempotency_key: input.idempotencyKey,
    p_customer_name: input.customerName,
    p_customer_phone: input.customerPhone,
    p_comment: input.comment,
    p_payment_method: input.paymentMethod,
    p_items: input.items.map((i) => ({ product_id: i.productId, quantity: i.quantity, option_ids: i.optionIds })),
  });

  if (error || !data) {
    const code = Object.keys(ERRORS).find((k) => error?.message?.includes(k));
    if (!code) console.error("[orders] create_order failed:", error?.message);
    return NextResponse.json(
      { error: code ? ERRORS[code] : "Не удалось оформить заказ. Попробуйте ещё раз." },
      { status: code ? 409 : 500 },
    );
  }

  const order = data as { order_id: string; order_number: string; total: number; is_new: boolean };

  // Заказ уже сохранён. Уведомление — только для нового заказа (не для повторного нажатия).
  if (order.is_new) await notifyOrder(order.order_id);

  return NextResponse.json({ orderNumber: order.order_number, total: order.total }, { status: order.is_new ? 201 : 200 });
}
