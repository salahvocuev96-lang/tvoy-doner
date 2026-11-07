import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { firstError, reviewSchema } from "@/lib/validation";
import { clientKeyHash, isSameOrigin } from "@/lib/request";

const MIN_FILL_MS = 3000;

export async function POST(request: Request) {
  if (!(await isSameOrigin())) {
    return NextResponse.json({ error: "Запрос отклонён" }, { status: 403 });
  }

  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }
  const input = parsed.data;

  // Бот заполнил скрытое поле или отправил форму мгновенно — делаем вид, что всё ок.
  if (input.website || Date.now() - input.startedAt < MIN_FILL_MS) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const db = createServiceClient();
  if (!db) return NextResponse.json({ error: "Сервер не настроен" }, { status: 503 });

  // Не более 3 отзывов за сутки с одного адреса.
  const { data: allowed } = await db.rpc("check_rate_limit", {
    p_action: "review",
    p_key_hash: await clientKeyHash(),
    p_max: 3,
    p_window_seconds: 86400,
  });
  if (allowed === false) {
    return NextResponse.json({ error: "Вы уже оставили несколько отзывов. Спасибо!" }, { status: 429 });
  }

  const { error } = await db.from("reviews").insert({
    author_name: input.authorName,
    rating: input.rating,
    body: input.body,
    status: "pending",
  });
  if (error) {
    console.error("[reviews]", error.message);
    return NextResponse.json({ error: "Не удалось отправить отзыв. Попробуйте позже." }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
