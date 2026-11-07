export const formatPrice = (value: number) =>
  `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;

/** Нормализует российский номер к виду +7XXXXXXXXXX или возвращает null. */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 11 && (digits.startsWith("8") || digits.startsWith("7"))) digits = digits.slice(1);
  if (digits.length !== 10) return null;
  return `+7${digits}`;
}

/** +79662664682 → +7 (966) 266-46-82 */
export function prettyPhone(normalized: string): string {
  const d = normalized.replace(/\D/g, "").slice(-10);
  if (d.length !== 10) return normalized;
  return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8)}`;
}

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export function formatDate(iso: string, withTime = false) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Europe/Moscow",
  }).format(new Date(iso));
}

export function pluralize(n: number, forms: [string, string, string]) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

/** Убирает HTML-теги, управляющие символы и лишние пробелы из пользовательского текста. */
export function cleanText(input: string, { multiline = false } = {}) {
  let s = input.normalize("NFC").replace(/<[^>]*>/g, "").replace(/[<>]/g, "");
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮]/g, "");
  s = multiline ? s.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n") : s.replace(/\s+/g, " ");
  return s.trim();
}
