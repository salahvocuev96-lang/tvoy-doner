"use server";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";
import { CACHE_TAGS } from "@/lib/data/tags";
import { notifyOrder, sendTelegramMessage, isTelegramConfigured } from "@/lib/telegram";
import { cleanText } from "@/lib/format";
import type { OrderStatus, ReviewStatus } from "@/types";

export type ActionResult = { ok: true; message?: string; id?: string } | { ok: false; error: string };

const fail = (error: string): ActionResult => ({ ok: false, error });
const dbError = (e: { message: string; code?: string } | null, fallback = "Ошибка базы данных") => {
  if (e?.code === "23503") return fail("Нельзя удалить: есть связанные записи (например, товары в категории).");
  if (e?.code === "23505") return fail("Такое значение уже существует.");
  if (e?.code === "23514") return fail("Проверьте значения полей: одно из них вне допустимых пределов.");
  return fail(fallback);
};

// ---------------- Авторизация ----------------
export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------------- Заказы ----------------
const STATUSES = ["new", "accepted", "preparing", "ready", "completed", "cancelled"] as const;

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!z.uuid().safeParse(orderId).success || !STATUSES.includes(status)) return fail("Некорректные данные");
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) return dbError(error);
  return { ok: true };
}

export async function setOrderPaid(orderId: string, isPaid: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!z.uuid().safeParse(orderId).success) return fail("Некорректные данные");
  const { error } = await supabase.from("orders").update({ is_paid: isPaid }).eq("id", orderId);
  if (error) return dbError(error);
  return { ok: true };
}

export async function resendOrderNotification(orderId: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("orders").select("id").eq("id", orderId).maybeSingle();
  if (!data) return fail("Заказ не найден");
  const r = await notifyOrder(orderId);
  return r.ok ? { ok: true, message: "Уведомление отправлено" } : fail(`Не отправлено: ${r.error}`);
}

/** Повторная отправка всех заказов, уведомление о которых не дошло. */
export async function resendFailedNotifications(): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("orders").select("id").in("notify_status", ["failed", "pending"]).order("created_at").limit(20);
  let sent = 0;
  for (const o of data ?? []) if ((await notifyOrder(o.id)).ok) sent++;
  return { ok: true, message: `Отправлено: ${sent} из ${data?.length ?? 0}` };
}

// ---------------- Меню: товары ----------------
const optionSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().transform((v) => cleanText(v)).pipe(z.string().min(1, "Название добавки обязательно").max(60)),
  price: z.coerce.number().int("Цена — целое число").min(0).max(10000),
  is_active: z.boolean(),
});

const productSchema = z.object({
  id: z.uuid().optional(),
  category_id: z.uuid("Выберите категорию"),
  name: z.string().transform((v) => cleanText(v)).pipe(z.string().min(1, "Введите название").max(100)),
  description: z.string().max(600, "Описание до 600 символов").transform((v) => cleanText(v, { multiline: true }) || null),
  weight: z.string().max(30).transform((v) => cleanText(v) || null),
  price: z.coerce.number().int("Цена — целое число").min(0, "Цена не может быть отрицательной").max(100000),
  image_url: z.string().max(500).nullable().transform((v) => v || null)
    .refine((v) => !v || /^https?:\/\//.test(v) || v.startsWith("/"), "Некорректная ссылка на фото"),
  sort_order: z.coerce.number().int().min(-1000).max(10000),
  is_active: z.boolean(),
  is_available: z.boolean(),
  is_featured: z.boolean(),
  needs_verification: z.boolean(),
  options: z.array(optionSchema).max(30),
});

export type ProductInput = z.input<typeof productSchema>;

export async function saveProduct(input: ProductInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Проверьте поля");
  const { id, options, ...fields } = parsed.data;

  let productId = id;
  if (productId) {
    const { error } = await supabase.from("products").update(fields).eq("id", productId);
    if (error) return dbError(error);
  } else {
    const { data, error } = await supabase.from("products").insert(fields).select("id").single();
    if (error || !data) return dbError(error);
    productId = data.id as string;
  }

  // Синхронизация добавок: удалить отсутствующие, обновить существующие, создать новые.
  const { data: existing } = await supabase.from("product_options").select("id").eq("product_id", productId);
  const keep = new Set(options.filter((o) => o.id).map((o) => o.id));
  const toDelete = (existing ?? []).map((o) => o.id as string).filter((x) => !keep.has(x));
  if (toDelete.length) {
    const { error } = await supabase.from("product_options").delete().in("id", toDelete);
    if (error) return dbError(error);
  }
  for (const [i, o] of options.entries()) {
    const row = { product_id: productId, name: o.name, price: o.price, is_active: o.is_active, sort_order: i * 10 };
    const { error } = o.id
      ? await supabase.from("product_options").update(row).eq("id", o.id).eq("product_id", productId)
      : await supabase.from("product_options").insert(row);
    if (error) return dbError(error);
  }

  updateTag(CACHE_TAGS.menu);
  return { ok: true, id: productId, message: "Сохранено" };
}

const toggleFields = ["is_active", "is_available", "is_featured"] as const;

export async function toggleProduct(id: string, field: (typeof toggleFields)[number], value: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!toggleFields.includes(field) || !z.uuid().safeParse(id).success) return fail("Некорректные данные");
  const { error } = await supabase.from("products").update({ [field]: value }).eq("id", id);
  if (error) return dbError(error);
  updateTag(CACHE_TAGS.menu);
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return dbError(error);
  updateTag(CACHE_TAGS.menu);
  return { ok: true };
}

// ---------------- Меню: категории ----------------
const categorySchema = z.object({
  id: z.uuid().optional(),
  name: z.string().transform((v) => cleanText(v)).pipe(z.string().min(1, "Введите название").max(60)),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{2,40}$/, "Код: латиница, цифры и дефис (2–40 символов)"),
  sort_order: z.coerce.number().int().min(-1000).max(10000),
  is_active: z.boolean(),
});

export async function saveCategory(input: z.input<typeof categorySchema>): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Проверьте поля");
  const { id, ...fields } = parsed.data;
  const { error } = id
    ? await supabase.from("categories").update(fields).eq("id", id)
    : await supabase.from("categories").insert(fields);
  if (error) return dbError(error);
  updateTag(CACHE_TAGS.menu);
  return { ok: true, message: "Сохранено" };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return dbError(error);
  updateTag(CACHE_TAGS.menu);
  return { ok: true };
}

// ---------------- Отзывы ----------------
export async function setReviewStatus(id: string, status: ReviewStatus): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!["pending", "approved", "rejected", "hidden"].includes(status)) return fail("Некорректный статус");
  const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
  if (error) return dbError(error);
  updateTag(CACHE_TAGS.reviews);
  return { ok: true };
}

export async function deleteReview(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return dbError(error);
  updateTag(CACHE_TAGS.reviews);
  return { ok: true };
}

// ---------------- Настройки ----------------
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Время в формате ЧЧ:ММ");
const settingsSchema = z.object({
  name: z.string().transform((v) => cleanText(v)).pipe(z.string().min(1).max(80)),
  phone: z.string().transform((v) => cleanText(v)).pipe(z.string().min(5, "Укажите телефон").max(40)),
  address: z.string().transform((v) => cleanText(v)).pipe(z.string().min(5, "Укажите адрес").max(200)),
  address_note: z.string().max(200).transform((v) => cleanText(v) || null),
  postal_code: z.string().max(12).transform((v) => cleanText(v) || null),
  hours_text: z.string().transform((v) => cleanText(v)).pipe(z.string().min(1).max(120)),
  open_time: time,
  close_time: time,
  ordering_enabled: z.boolean(),
  combos_enabled: z.boolean(),
});

export async function saveSettings(input: z.input<typeof settingsSchema>): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Проверьте поля");
  const { error } = await supabase.from("store_settings").update(parsed.data).eq("id", 1);
  if (error) return dbError(error);
  // Переключатель комбо синхронно включает/выключает категорию «combo».
  await supabase.from("categories").update({ is_active: parsed.data.combos_enabled }).eq("slug", "combo");
  updateTag(CACHE_TAGS.settings);
  updateTag(CACHE_TAGS.menu);
  return { ok: true, message: "Настройки сохранены" };
}

export async function sendTelegramTest(): Promise<ActionResult> {
  await requireAdmin();
  if (!isTelegramConfigured()) return fail("Не заданы TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID");
  const r = await sendTelegramMessage("✅ Тестовое сообщение: уведомления о заказах подключены.");
  return r.ok ? { ok: true, message: "Сообщение отправлено — проверьте Telegram" } : fail(`Ошибка Telegram: ${r.error}`);
}
