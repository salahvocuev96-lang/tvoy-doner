import type { Product } from "@/types";
import type { CartLine } from "./store";

export interface PricedLine extends CartLine {
  product: Product;
  options: { id: string; name: string; price: number }[];
  unitPrice: number;
  lineTotal: number;
}

/** Пересчёт корзины по актуальному меню (только для отображения). */
export function priceCart(lines: CartLine[], products: Map<string, Product>) {
  const priced: PricedLine[] = [];
  for (const line of lines) {
    const product = products.get(line.productId);
    if (!product || !product.is_available) continue;
    const options = line.optionIds
      .map((id) => product.product_options.find((o) => o.id === id))
      .filter((o): o is NonNullable<typeof o> => Boolean(o));
    if (options.length !== line.optionIds.length) continue;
    const unitPrice = product.price + options.reduce((s, o) => s + o.price, 0);
    priced.push({ ...line, product, options, unitPrice, lineTotal: unitPrice * line.quantity });
  }
  return {
    lines: priced,
    total: priced.reduce((s, l) => s + l.lineTotal, 0),
    count: priced.reduce((s, l) => s + l.quantity, 0),
  };
}
