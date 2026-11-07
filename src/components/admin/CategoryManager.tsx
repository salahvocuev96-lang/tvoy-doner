"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { Card, inputCls } from "./ui";
import type { Category } from "@/types";

export function CategoryManager({ categories }: { categories: Category[] }) {
  return (
    <Card className="h-fit xl:sticky xl:top-6">
      <h2 className="font-bold">Категории</h2>
      <p className="mt-1 text-xs text-cream/45">Код — латиницей, используется для иконки-заглушки. «combo» — комбо-наборы (показываются, если включены в настройках).</p>
      <div className="mt-4 space-y-3">
        {categories.map((c) => <CategoryRow key={c.id} category={c} />)}
        <CategoryRow />
      </div>
    </Card>
  );
}

function CategoryRow({ category }: { category?: Category }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [sort, setSort] = useState(String(category?.sort_order ?? 100));
  const [active, setActive] = useState(category?.is_active ?? true);
  const [msg, setMsg] = useState<string | null>(null);

  const save = () =>
    start(async () => {
      const r = await saveCategory({ id: category?.id, name, slug, sort_order: sort, is_active: active });
      setMsg(r.ok ? "Сохранено" : r.error);
      if (r.ok && !category) {
        setName("");
        setSlug("");
      }
      router.refresh();
    });

  return (
    <div className={`rounded-2xl border p-3 ${category ? "border-cream/10" : "border-dashed border-gold/30"}`}>
      {!category && <p className="mb-2 text-xs font-bold text-gold">Новая категория</p>}
      <div className="grid grid-cols-[1fr_90px_60px] gap-2">
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Название" aria-label="Название категории" />
        <input className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="код" aria-label="Код категории" />
        <input className={inputCls} value={sort} onChange={(e) => setSort(e.target.value)} inputMode="numeric" aria-label="Порядок" title="Порядок сортировки" />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-[#d99a45]" /> Показывать
        </label>
        <button type="button" onClick={save} disabled={pending} className="ml-auto rounded-lg bg-cream/10 px-3 py-1.5 text-xs font-bold hover:bg-gold hover:text-coffee">
          {pending ? "…" : category ? "Сохранить" : "Добавить"}
        </button>
        {category && (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!confirm(`Удалить категорию «${category.name}»?`)) return;
              start(async () => {
                const r = await deleteCategory(category.id);
                setMsg(r.ok ? null : r.error);
                router.refresh();
              });
            }}
            className="rounded-lg px-2 py-1.5 text-xs text-terracotta-400 hover:bg-terracotta/20"
          >
            Удалить
          </button>
        )}
      </div>
      {msg && <p className="mt-1 text-xs text-cream/60">{msg}</p>}
    </div>
  );
}
