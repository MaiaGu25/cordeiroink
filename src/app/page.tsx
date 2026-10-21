import { getCatalogItems, getStorefrontBanners } from "@/actions/storefront";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontBannerCarousel } from "@/components/storefront/StorefrontBannerCarousel";
import { StorefrontHero } from "@/components/storefront/StorefrontHero";
import { BrandQuoteBanner } from "@/components/storefront/BrandQuoteBanner";
import { StorefrontCatalog } from "@/components/storefront/StorefrontCatalog";
import { AboutSection } from "@/components/storefront/AboutSection";
import { CustomOrderSection } from "@/components/storefront/CustomOrderSection";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { CartProvider } from "@/components/storefront/CartContext";
import { StorefrontCartDrawer } from "@/components/storefront/StorefrontCartDrawer";

export const dynamic = "force-dynamic";

export default async function StorefrontPage() {
  const [catalogItems, banners] = await Promise.all([
    getCatalogItems(false),
    getStorefrontBanners(false),
  ]);

  return (
    <CartProvider>
      <div className="min-h-screen bg-[#F7F4EE] text-[#0A0A0A] selection:bg-[#0A0A0A] selection:text-[#F7F4EE] flex flex-col justify-between">
        <div>
          <StorefrontHeader />
          <StorefrontBannerCarousel banners={banners} />
          <main>
            <StorefrontHero />
            <BrandQuoteBanner />
            <StorefrontCatalog items={catalogItems} />
            <AboutSection />
            <CustomOrderSection />
          </main>
        </div>
        <StorefrontFooter />
        <StorefrontCartDrawer />
      </div>
    </CartProvider>
  );
}
