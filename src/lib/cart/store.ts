"use client";
import { useSyncExternalStore } from "react";

/**
 * Корзина хранит только идентификаторы и количество.
 * Названия и цены всегда берутся из актуального меню, а итог
 * пересчитывается сервером при оформлении заказа.
 */
export interface CartLine {
  key: string;
  productId: string;
  optionIds: string[];
  quantity: number;
}

const STORAGE_KEY = "td-cart-v1";
export const MAX_QTY = 50;
const listeners = new Set<() => void>();
let lines: CartLine[] = [];
let loaded = false;

const lineKey = (productId: string, optionIds: string[]) => [productId, ...[...optionIds].sort()].join("|");

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (Array.isArray(raw)) {
      lines = raw
        .filter((l) => typeof l?.productId === "string" && Number.isInteger(l?.quantity))
        .map((l) => ({
          productId: l.productId,
          optionIds: Array.isArray(l.optionIds) ? l.optionIds.filter((x: unknown) => typeof x === "string") : [],
          quantity: Math.min(MAX_QTY, Math.max(1, l.quantity)),
          key: lineKey(l.productId, l.optionIds ?? []),
        }));
    }
  } catch {
    lines = [];
  }
}

function commit(next: CartLine[]) {
  lines = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* приватный режим — корзина живёт до закрытия вкладки */
  }
  listeners.forEach((l) => l());
}

export const cart = {
  add(productId: string, optionIds: string[] = [], quantity = 1) {
    load();
    const key = lineKey(productId, optionIds);
    const existing = lines.find((l) => l.key === key);
    commit(
      existing
        ? lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + quantity) } : l))
        : [...lines, { key, productId, optionIds: [...optionIds].sort(), quantity: Math.min(MAX_QTY, quantity) }],
    );
  },
  setQuantity(key: string, quantity: number) {
    load();
    if (quantity < 1) return cart.remove(key);
    commit(lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QTY, Math.floor(quantity)) } : l)));
  },
  remove(key: string) {
    load();
    commit(lines.filter((l) => l.key !== key));
  },
  /** Убирает строки с товарами, которых больше нет в меню. */
  prune(isValid: (line: CartLine) => boolean) {
    load();
    const next = lines.filter(isValid);
    if (next.length !== lines.length) commit(next);
  },
  clear() {
    commit([]);
  },
};

const EMPTY: CartLine[] = [];

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      loaded = false;
      load();
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCartLines() {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return lines;
    },
    () => EMPTY,
  );
}
