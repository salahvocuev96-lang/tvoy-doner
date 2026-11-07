import { z } from "zod";
import { cleanText, normalizePhone } from "./format";

const name = z
  .string()
  .transform((v) => cleanText(v))
  .pipe(z.string().min(2, "Введите имя").max(60, "Слишком длинное имя"));

export const orderSchema = z.object({
  idempotencyKey: z.uuid(),
  customerName: name,
  customerPhone: z
    .string()
    .transform((v, ctx) => {
      const p = normalizePhone(v);
      if (!p) {
        ctx.addIssue({ code: "custom", message: "Введите номер в формате +7 XXX XXX-XX-XX" });
        return z.NEVER;
      }
      return p;
    }),
  comment: z
    .string()
    .max(2000)
    .optional()
    .transform((v) => (v ? cleanText(v, { multiline: true }) : ""))
    .pipe(z.string().max(500, "Комментарий до 500 символов")),
  paymentMethod: z.enum(["cash", "card"]),
  items: z
    .array(
      z.object({
        productId: z.uuid(),
        quantity: z.number().int().min(1).max(50),
        optionIds: z.array(z.uuid()).max(20).default([]),
      }),
    )
    .min(1, "Корзина пуста")
    .max(30, "Слишком много позиций"),
  // Цены из браузера намеренно не принимаются.
});

export type OrderInput = z.input<typeof orderSchema>;

export const reviewSchema = z.object({
  authorName: name,
  rating: z.number().int().min(1).max(5),
  body: z
    .string()
    .max(3000)
    .transform((v) => cleanText(v, { multiline: true }))
    .pipe(
      z
        .string()
        .min(10, "Отзыв должен быть не короче 10 символов")
        .max(1000, "Отзыв должен быть не длиннее 1000 символов")
        .refine((v) => (v.match(/https?:\/\/|www\./gi) ?? []).length === 0, "Ссылки в отзывах запрещены"),
    ),
  // Антиспам: скрытое поле (должно быть пустым) и время заполнения формы.
  website: z.string().max(500).optional().default(""),
  startedAt: z.number().int(),
});

export type ReviewInput = z.input<typeof reviewSchema>;

export const firstError = (err: z.ZodError) => err.issues[0]?.message ?? "Проверьте введённые данные";
