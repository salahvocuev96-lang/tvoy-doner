import type { Metadata, Viewport } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { siteMeta } from "@/config/site";
import { getStoreSettings } from "@/lib/data/settings";
import "./globals.css";

const unbounded = Unbounded({ subsets: ["latin", "cyrillic"], weight: ["500", "700", "800", "900"], variable: "--font-unbounded", display: "swap" });
const manrope = Manrope({ subsets: ["latin", "cyrillic"], weight: ["400", "500", "600", "700", "800"], variable: "--font-manrope", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getStoreSettings();
  const title = `${s.name} — шаурма и выпечка на Маршала Жукова, Москва`;
  return {
    metadataBase: new URL(siteMeta.url),
    title: { default: title, template: `%s — ${s.name}` },
    description: siteMeta.description,
    keywords: ["шаурма", "донер", "шаурма Москва", "шаурма Маршала Жукова", "Хорошёво-Мнёвники", "выпечка", "самовывоз", "уличная еда"],
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      url: "/",
      siteName: s.name,
      title,
      description: siteMeta.description,
    },
    twitter: { card: "summary_large_image", title, description: siteMeta.description },
    robots: { index: true, follow: true },
    formatDetection: { telephone: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#211712",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${unbounded.variable} ${manrope.variable}`}>
      <body className="min-h-svh overflow-x-clip">{children}</body>
    </html>
  );
}
