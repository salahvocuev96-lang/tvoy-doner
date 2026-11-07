/**
 * Данные заведения по умолчанию.
 * Используются, если база данных недоступна. Основной источник — таблица
 * store_settings (редактируется в админке → «Настройки»).
 */
export const siteDefaults = {
  name: "Твой Донер",
  phone: "+7 (966) 266-46-82",
  address: "Москва, проспект Маршала Жукова, 14, корп. 1",
  addressNote: "Первый этаж",
  postalCode: "123308",
  hoursText: "Ежедневно с 10:00 до 23:00",
  openTime: "10:00",
  closeTime: "23:00",
  orderingEnabled: true,
  combosEnabled: false,
} as const;

export const siteMeta = {
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  city: "Москва",
  description:
    "Горячая шаурма, свежие ингредиенты и любимая выпечка каждый день. Самовывоз на проспекте Маршала Жукова, 14 — Москва, Хорошёво-Мнёвники.",
  timezone: "Europe/Moscow",
} as const;

export const ORDER_STATUS_LABELS = {
  new: "Новый",
  accepted: "Принят",
  preparing: "Готовится",
  ready: "Готов к выдаче",
  completed: "Выполнен",
  cancelled: "Отменён",
} as const;

export const PAYMENT_LABELS = {
  cash: "Наличными при получении",
  card: "Картой в заведении",
} as const;

export const REVIEW_STATUS_LABELS = {
  pending: "На модерации",
  approved: "Опубликован",
  rejected: "Отклонён",
  hidden: "Скрыт",
} as const;

export const PRODUCT_IMAGES_BUCKET = "product-images";
