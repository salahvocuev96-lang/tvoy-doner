"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct, saveProduct } from "@/app/admin/actions";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { PRODUCT_IMAGES_BUCKET } from "@/config/site";
import { ProductImage } from "@/components/menu/ProductImage";
import { Card, inputCls } from "./ui";
import type { Category, Product } from "@/types";

interface OptionDraft { key: string; id?: string; name: string; price: string; is_active: boolean }

const MAX_IMAGE_MB = 5;

export function ProductForm({ product, categories }: { product: Product | null; categories: Category[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const [f, setF] = useState({
    category_id: product?.category_id ?? categories[0]?.id ?? "",
    name: product?.name ?? "",
    description: product?.description ?? "",
    weight: product?.weight ?? "",
    price: String(product?.price ?? ""),
    image_url: product?.image_url ?? "",
    sort_order: String(product?.sort_order ?? 0),
    is_active: product?.is_active ?? true,
    is_available: product?.is_available ?? true,
    is_featured: product?.is_featured ?? false,
    needs_verification: product?.needs_verification ?? false,
  });
  const [options, setOptions] = useState<OptionDraft[]>(
    (product?.product_options ?? []).map((o) => ({ key: o.id, id: o.id, name: o.name, price: String(o.price), is_active: o.is_active })),
  );
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));
  const slug = categories.find((c) => c.id === f.category_id)?.slug;

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) return setMsg({ ok: false, text: "Нужен файл изображения (JPG, PNG, WebP)" });
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return setMsg({ ok: false, text: `Файл больше ${MAX_IMAGE_MB} МБ` });
    setUploading(true);
    setMsg(null);
    const supabase = createBrowserSupabase();
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `products/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, file, { cacheControl: "31536000", contentType: file.type });
    setUploading(false);
    if (error) return setMsg({ ok: false, text: `Не удалось загрузить фото: ${error.message}` });
    const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
    set("image_url", data.publicUrl);
    setMsg({ ok: true, text: "Фото загружено — не забудьте сохранить товар" });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const r = await saveProduct({
        id: product?.id,
        ...f,
        image_url: f.image_url || null,
        options: options.map((o) => ({ id: o.id, name: o.name, price: o.price, is_active: o.is_active })),
      });
      if (!r.ok) return setMsg({ ok: false, text: r.error });
      setMsg({ ok: true, text: "Сохранено. Изменения уже на сайте." });
      if (!product && r.id) router.replace(`/admin/menu/${r.id}`);
      router.refresh();
    });
  };

  const label = "mb-1.5 block text-sm font-semibold text-cream/70";

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5">
        <Card className="space-y-4">
          <label className="block">
            <span className={label}>Название *</span>
            <input className={inputCls} value={f.name} onChange={(e) => set("name", e.target.value)} maxLength={100} required />
          </label>
          <label className="block">
            <span className={label}>Описание / состав</span>
            <textarea className={`${inputCls} min-h-24`} value={f.description} onChange={(e) => set("description", e.target.value)} maxLength={600} />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className={label}>Цена, ₽ *</span>
              <input className={inputCls} value={f.price} onChange={(e) => set("price", e.target.value.replace(/\D/g, ""))} inputMode="numeric" required />
            </label>
            <label className="block">
              <span className={label}>Вес / объём</span>
              <input className={inputCls} value={f.weight} onChange={(e) => set("weight", e.target.value)} placeholder="300 г" maxLength={30} />
            </label>
            <label className="block">
              <span className={label}>Порядок</span>
              <input className={inputCls} value={f.sort_order} onChange={(e) => set("sort_order", e.target.value.replace(/[^\d-]/g, ""))} inputMode="numeric" />
            </label>
          </div>
          <label className="block">
            <span className={label}>Категория *</span>
            <select className={inputCls} value={f.category_id} onChange={(e) => set("category_id", e.target.value)}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}{c.is_active ? "" : " (скрыта)"}</option>)}
            </select>
          </label>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Дополнительные ингредиенты</h2>
            <button type="button" onClick={() => setOptions((o) => [...o, { key: crypto.randomUUID(), name: "", price: "0", is_active: true }])} className="rounded-lg bg-cream/10 px-3 py-1.5 text-xs font-bold hover:bg-gold hover:text-coffee">
              + Добавка
            </button>
          </div>
          {options.length === 0 && <p className="mt-3 text-sm text-cream/45">Нет добавок. Клиент сможет выбрать их при заказе.</p>}
          <div className="mt-3 space-y-2">
            {options.map((o, i) => (
              <div key={o.key} className="grid grid-cols-[1fr_90px_auto_auto] items-center gap-2">
                <input className={inputCls} value={o.name} placeholder="Название" aria-label="Название добавки" onChange={(e) => setOptions((all) => all.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                <input className={inputCls} value={o.price} inputMode="numeric" aria-label="Цена добавки" onChange={(e) => setOptions((all) => all.map((x, j) => (j === i ? { ...x, price: e.target.value.replace(/\D/g, "") } : x)))} />
                <label className="flex items-center gap-1 text-xs text-cream/60" title="Доступна">
                  <input type="checkbox" className="accent-[#d99a45]" checked={o.is_active} onChange={(e) => setOptions((all) => all.map((x, j) => (j === i ? { ...x, is_active: e.target.checked } : x)))} /> вкл
                </label>
                <button type="button" onClick={() => setOptions((all) => all.filter((_, j) => j !== i))} className="px-2 text-terracotta-400" aria-label="Удалить добавку">✕</button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <Card>
          <h2 className="mb-3 font-bold">Фото</h2>
          <ProductImage src={f.image_url || null} alt={f.name || "Товар"} category={slug} className="aspect-[4/3] w-full rounded-2xl" sizes="340px" />
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-xl bg-cream/10 px-4 py-2 text-sm font-bold hover:bg-gold hover:text-coffee">
              {uploading ? "Загрузка…" : "Загрузить фото"}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" disabled={uploading} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </label>
            {f.image_url && (
              <button type="button" onClick={() => set("image_url", "")} className="rounded-xl px-3 py-2 text-sm text-terracotta-400 hover:bg-terracotta/20">Убрать</button>
            )}
          </div>
          <p className="mt-2 text-xs text-cream/40">JPG/PNG/WebP до {MAX_IMAGE_MB} МБ. Лучше горизонтальное 4:3.</p>
        </Card>

        <Card className="space-y-3 text-sm">
          {([
            ["is_active", "Показывать на сайте"],
            ["is_available", "Есть в наличии"],
            ["is_featured", "В «Популярных блюдах»"],
            ["needs_verification", "Требует сверки с меню"],
          ] as const).map(([k, l]) => (
            <label key={k} className="flex items-center gap-3">
              <input type="checkbox" className="size-4 accent-[#d99a45]" checked={f[k]} onChange={(e) => set(k, e.target.checked)} /> {l}
            </label>
          ))}
        </Card>

        {msg && <p className={`rounded-xl px-4 py-3 text-sm ${msg.ok ? "bg-olive/25 text-cream" : "bg-terracotta/15 text-terracotta-400"}`} role="status">{msg.text}</p>}

        <div className="flex gap-2">
          <button type="submit" disabled={pending || uploading} className="flex-1 rounded-xl bg-gold py-3 font-bold text-coffee hover:bg-gold-300 disabled:opacity-50">
            {pending ? "Сохраняем…" : "Сохранить"}
          </button>
          {product && (
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!confirm(`Удалить «${product.name}»? Лучше скрыть товар, если он временно отсутствует.`)) return;
                start(async () => {
                  const r = await deleteProduct(product.id);
                  if (!r.ok) return setMsg({ ok: false, text: r.error });
                  router.replace("/admin/menu");
                  router.refresh();
                });
              }}
              className="rounded-xl border border-terracotta/50 px-4 text-sm font-bold text-terracotta-400 hover:bg-terracotta hover:text-cream"
            >
              Удалить
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
