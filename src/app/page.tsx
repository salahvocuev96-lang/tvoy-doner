import { siteMeta } from "@/config/site";
import { getMenu } from "@/lib/data/menu";
import { getPublishedReviews } from "@/lib/data/reviews";
import { getStoreSettings } from "@/lib/data/settings";
import { ShopProvider } from "@/components/cart/ShopProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/hero/Hero";
import { Marquee } from "@/components/site/Marquee";
import { PopularSection } from "@/components/menu/PopularSection";
import { MenuSection } from "@/components/menu/MenuSection";
import { ProductModal } from "@/components/menu/ProductModal";
import { About } from "@/components/site/About";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { Contacts } from "@/components/site/Contacts";
import { Footer } from "@/components/site/Footer";

export default async function Home() {
  const settings = await getStoreSettings();
  const [menu, reviews] = await Promise.all([getMenu(settings.combosEnabled), getPublishedReviews()]);
  const products = menu.categories.flatMap((c) => c.products);
  const categorySlugs = Object.fromEntries(menu.categories.map((c) => [c.id, c.slug]));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: settings.name,
    url: siteMeta.url,
    telephone: settings.phone.replace(/[^\d+]/g, ""),
    servesCuisine: ["Шаурма", "Восточная кухня", "Выпечка"],
    priceRange: "₽",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address.replace(/^Москва,\s*/, ""),
      addressLocality: "Москва",
      postalCode: settings.postalCode ?? undefined,
      addressCountry: "RU",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: settings.openTime,
        closes: settings.closeTime,
      },
    ],
  };

  return (
    <ShopProvider products={products} settings={settings}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Header />
      <main>
        <Hero settings={settings} />
        <Marquee />
        <PopularSection categories={menu.categories} />
        <MenuSection categories={menu.categories} unavailable={menu.error} />
        <About settings={settings} />
        <ReviewsSection reviews={reviews.reviews} summary={reviews.summary} />
        <Contacts settings={settings} />
      </main>
      <Footer settings={settings} />
      <CartDrawer />
      <ProductModal categorySlugs={categorySlugs} />
    </ShopProvider>
  );
}
