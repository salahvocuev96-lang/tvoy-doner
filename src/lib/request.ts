import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";

/** Хэш IP-адреса клиента (сам IP не хранится). */
export async function clientKeyHash() {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const salt = process.env.RATE_LIMIT_SALT || "tvoy-doner";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/** Простая защита от CSRF: запрос должен прийти с того же сайта. */
export async function isSameOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
