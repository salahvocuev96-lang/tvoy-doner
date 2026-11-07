/** Открыто ли заведение сейчас (по московскому времени). */
export function isOpenNow(openTime: string, closeTime: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Moscow" }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === "hour")?.value);
  const m = Number(parts.find((p) => p.type === "minute")?.value);
  const cur = h * 60 + m;
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const o = toMin(openTime);
  const c = toMin(closeTime);
  return o <= c ? cur >= o && cur < c : cur >= o || cur < c;
}
