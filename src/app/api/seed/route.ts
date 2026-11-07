import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";

// Одноразовый эндпоинт для заливки меню.
// Защищён секретом из переменной окружения SEED_SECRET.
// После использования переменную можно удалить из Vercel.

const MENU: {
  category: string;
  items: { name: string; slug: string; price: number; weight_g: number; popular?: boolean; sort_order: number }[]; // slug kept for reference, not inserted
}[] = [
  {
    category: "shawarma",
    items: [
      { name: "Шаурма классическая",  slug: "shawarma-klassicheskaya",   price: 270, weight_g: 350, popular: true,  sort_order: 10 },
      { name: "Шаурма чиз",           slug: "shawarma-chiz",              price: 320, weight_g: 350, popular: true,  sort_order: 20 },
      { name: "Шаурма барбекю",       slug: "shawarma-barbeku",           price: 320, weight_g: 350,                sort_order: 30 },
      { name: "Шаурма терияки",       slug: "shawarma-teriyaki",          price: 310, weight_g: 350,                sort_order: 40 },
      { name: "Шаурма Цезарь",        slug: "shawarma-czezar",            price: 320, weight_g: 350,                sort_order: 50 },
      { name: "Шаурма микс",          slug: "shawarma-miks",              price: 370, weight_g: 750, popular: true,  sort_order: 60 },
      { name: "Шаурма с говядиной",   slug: "shawarma-s-govyadinoy",      price: 420, weight_g: 750, popular: true,  sort_order: 70 },
      { name: "Донер с курицей",      slug: "doner-s-kuricej",            price: 300, weight_g: 370,                sort_order: 80 },
      { name: "Донер с говядиной",    slug: "doner-s-govyadinoy",         price: 430, weight_g: 370,                sort_order: 90 },
      { name: "Люля кебаб говядина",  slug: "lyulya-kebab-govyadina",     price: 450, weight_g: 350,                sort_order: 100 },
      { name: "Люля кебаб баранина",  slug: "lyulya-kebab-baranina",      price: 470, weight_g: 350,                sort_order: 110 },
    ],
  },
  {
    category: "extras",
    items: [
      { name: "Мясо с говядиной", slug: "dobavka-myaso-govyadina", price: 160, weight_g: 100, sort_order: 10 },
      { name: "Мясо с курицей",   slug: "dobavka-myaso-kurica",    price: 130, weight_g: 90,  sort_order: 20 },
      { name: "Сыр",              slug: "dobavka-syr",             price: 120, weight_g: 90,  sort_order: 30 },
      { name: "Картошка фри",     slug: "dobavka-kartoshka-fri",   price: 50,  weight_g: 70,  sort_order: 40 },
      { name: "Соус на выбор",    slug: "dobavka-sous",            price: 50,  weight_g: 50,  sort_order: 50 },
      { name: "Халапеньо",        slug: "dobavka-xalapenyo",       price: 30,  weight_g: 80,  sort_order: 60 },
    ],
  },
  {
    category: "sides",
    items: [
      { name: "Картошка фри",           slug: "garnier-kartoshka-fri",             price: 180, weight_g: 150, sort_order: 10 },
      { name: "Картошка по-деревенски", slug: "garnier-kartoshka-po-derevenskiy",  price: 180, weight_g: 150, sort_order: 20 },
    ],
  },
  {
    category: "bakery",
    items: [
      { name: "Лепёшка большая",     slug: "lepyoshka-bolshaya",     price: 120, weight_g: 550, sort_order: 10 },
      { name: "Лепёшка маленькая",   slug: "lepyoshka-malenkaya",    price: 50,  weight_g: 250, sort_order: 20 },
      { name: "Фатир",               slug: "fatir",                  price: 110, weight_g: 300, sort_order: 30 },
      { name: "Чебурек с говядиной", slug: "cheburek-s-govyadinoy",  price: 110, weight_g: 250, sort_order: 40 },
      { name: "Чебурек с сыром",     slug: "cheburek-s-syrom",       price: 100, weight_g: 150, sort_order: 50 },
      { name: "Беляш с говядиной",   slug: "belyash-s-govyadinoy",   price: 110, weight_g: 130, sort_order: 60 },
      { name: "Пирожки с картошкой", slug: "pirozhki-s-kartoshkoy",  price: 70,  weight_g: 140, sort_order: 70 },
      { name: "Пирожки с говядиной", slug: "pirozhki-s-govyadinoy",  price: 90,  weight_g: 130, sort_order: 80 },
      { name: "Пирожки с капустой",  slug: "pirozhki-s-kapustoy",    price: 60,  weight_g: 130, sort_order: 90 },
      { name: "Сосиска в тесте",     slug: "sosiska-v-teste",        price: 100, weight_g: 150, sort_order: 100 },
      { name: "Самса с говядиной",   slug: "samsa-s-govyadinoy",     price: 110, weight_g: 160, sort_order: 110 },
      { name: "Самса с бараниной",   slug: "samsa-s-baraninoy",      price: 120, weight_g: 160, sort_order: 120 },
    ],
  },
  {
    category: "drinks",
    items: [
      { name: "Рич яблочный",        slug: "rich-yablochniy",          price: 200, weight_g: 1000, sort_order: 10 },
      { name: "Рич кола",            slug: "rich-kola",                price: 200, weight_g: 1000, sort_order: 20 },
      { name: "Кока-Кола 1л",        slug: "koka-kola-1l",             price: 200, weight_g: 1000, sort_order: 30 },
      { name: "Натахтари Дюшес",     slug: "natakhtari-dyushes",       price: 180, weight_g: 500,  sort_order: 40 },
      { name: "Натахтари Крем-сода", slug: "natakhtari-krem-soda",     price: 180, weight_g: 500,  sort_order: 50 },
      { name: "Натахтари Фейхоа",    slug: "natakhtari-fejxoa",        price: 180, weight_g: 500,  sort_order: 60 },
      { name: "Натахтари Тархун",    slug: "natakhtari-tarkhun",       price: 180, weight_g: 500,  sort_order: 70 },
      { name: "Султан чай Лимон",    slug: "sultan-chaj-limon",        price: 150, weight_g: 1000, sort_order: 80 },
      { name: "Султан чай Персик",   slug: "sultan-chaj-persik",       price: 150, weight_g: 1000, sort_order: 90 },
      { name: "Святая Гран Дюшес",   slug: "svyataya-gran-dyushes",    price: 120, weight_g: 500,  sort_order: 100 },
      { name: "Святая Гран Тархун",  slug: "svyataya-gran-tarkhun",    price: 120, weight_g: 500,  sort_order: 110 },
      { name: "Флавис",              slug: "flavis",                   price: 120, weight_g: 500,  sort_order: 120 },
      { name: "Фанта 0.5л",          slug: "fanta-05l",                price: 120, weight_g: 500,  sort_order: 130 },
      { name: "Кока-Кола 0.5л",      slug: "koka-kola-05l",            price: 120, weight_g: 500,  sort_order: 140 },
      { name: "Фанта 330мл",         slug: "fanta-330ml",              price: 120, weight_g: 330,  sort_order: 150 },
      { name: "Кока-Кола 330мл",     slug: "koka-kola-330ml",          price: 120, weight_g: 330,  sort_order: 160 },
      { name: "Айран",               slug: "ajran",                    price: 120, weight_g: 500,  sort_order: 170 },
      { name: "Морс",                slug: "mors",                     price: 120, weight_g: 500,  sort_order: 180 },
      { name: "Роял гранатовый",     slug: "royal-granatoviy",         price: 100, weight_g: 300,  sort_order: 190 },
      { name: "Драйв",               slug: "drajv",                    price: 120, weight_g: 445,  sort_order: 200 },
      { name: "Горилла",             slug: "gorilla",                  price: 120, weight_g: 450,  sort_order: 210 },
      { name: "Адреналин 445мл",     slug: "adrenelin-445ml",          price: 160, weight_g: 445,  sort_order: 220 },
      { name: "Адреналин Зеро",      slug: "adrenelin-zero",           price: 160, weight_g: 445,  sort_order: 230 },
      { name: "Адреналин 100мл",     slug: "adrenelin-100ml",          price: 120, weight_g: 100,  sort_order: 240 },
      { name: "Ред Булл 473мл",      slug: "red-bull-473ml",           price: 300, weight_g: 473,  sort_order: 250 },
      { name: "Ред Булл 500мл",      slug: "red-bull-500ml",           price: 160, weight_g: 500,  sort_order: 260 },
      { name: "Монстер",             slug: "monster",                  price: 250, weight_g: 449,  sort_order: 270 },
    ],
  },
];

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.SEED_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  // Удаляем старые данные
  await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // Активируем категории
  await supabase
    .from("categories")
    .update({ is_active: true })
    .in("slug", ["shawarma", "drinks", "extras", "sides", "bakery"]);

  // Получаем категории
  const { data: cats } = await supabase.from("categories").select("id, slug");
  if (!cats) return NextResponse.json({ error: "Categories not found" }, { status: 500 });

  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  const rows = MENU.flatMap(({ category, items }) =>
    items.map((item) => ({
      category_id: catMap[category],
      name: item.name,
      price: item.price,
      weight: `${item.weight_g} г`,
      is_available: true,
      is_featured: item.popular ?? false,
      sort_order: item.sort_order,
    }))
  );

  const { error } = await supabase.from("products").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateTag("menu", "minutes");

  return NextResponse.json({ ok: true, inserted: rows.length });
}
