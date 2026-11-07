import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Category, Product } from "@/types";

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const isNew = id === "new";
  if (!isNew && !/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [{ data: cats }, productRes] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    isNew
      ? Promise.resolve({ data: null })
      : supabase.from("products").select("*, product_options(*)").eq("id", id).maybeSingle(),
  ]);
  const product = productRes.data as Product | null;
  if (!isNew && !product) notFound();
  product?.product_options.sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      <Link href="/admin/menu" className="text-sm text-cream/50 hover:text-gold">← Меню</Link>
      <h1 className="mb-6 mt-3 font-display text-2xl font-bold sm:text-3xl">{isNew ? "Новый товар" : product?.name}</h1>
      <ProductForm product={product} categories={(cats ?? []) as Category[]} />
    </>
  );
}
