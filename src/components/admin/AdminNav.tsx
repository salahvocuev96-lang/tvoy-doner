"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/admin/actions";

const LINKS = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/menu", label: "Меню" },
  { href: "/admin/reviews", label: "Отзывы" },
  { href: "/admin/settings", label: "Настройки" },
];

export function AdminNav({ email }: { email: string }) {
  const path = usePathname();
  const isActive = (href: string) => (href === "/admin" ? path === href : path.startsWith(href));
  return (
    <aside className="sticky top-0 z-40 border-b border-cream/10 bg-coffee/95 backdrop-blur lg:flex lg:h-svh lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-3 px-4 py-3 lg:block lg:px-5 lg:py-7">
        <div>
          <Link href="/admin" className="font-display text-lg font-extrabold text-gold">Админка</Link>
          <Link href="/" target="_blank" className="ml-3 text-xs text-cream/50 hover:text-gold lg:ml-0 lg:mt-1 lg:block">Открыть сайт ↗</Link>
        </div>
        <form action={signOut} className="lg:hidden">
          <button className="text-sm font-semibold text-cream/60 hover:text-terracotta-400">Выйти</button>
        </form>
      </div>
      <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col" aria-label="Разделы админки">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${isActive(l.href) ? "bg-gold text-coffee" : "text-cream/70 hover:bg-cream/5 hover:text-cream"}`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto hidden px-5 pb-6 lg:block">
        <p className="truncate text-xs text-cream/40">{email}</p>
        <form action={signOut}>
          <button className="mt-2 text-sm font-semibold text-cream/70 hover:text-terracotta-400">Выйти</button>
        </form>
      </div>
    </aside>
  );
}
