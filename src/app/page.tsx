import {
  getCatalogItems,
  getStorefrontBanners,
  getBlankShirtsStock,
} from "@/actions/storefront";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontBannerCarousel } from "@/components/storefront/StorefrontBannerCarousel";
import { StorefrontHero } from "@/components/storefront/StorefrontHero";
import { FeaturedProductsShowcase } from "@/components/storefront/FeaturedProductsShowcase";
import { StorefrontCatalog } from "@/components/storefront/StorefrontCatalog";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { CartProvider } from "@/components/storefront/CartContext";
import { StorefrontCartDrawer } from "@/components/storefront/StorefrontCartDrawer";

export const dynamic = "force-dynamic";

export default async function StorefrontPage() {
  const [catalogItems, banners, stockItems] = await Promise.all([
    getCatalogItems(false),
    getStorefrontBanners(false),
    getBlankShirtsStock(),
  ]);

  return (
    <CartProvider>
      <div className="min-h-screen bg-[#F7F4EE] text-[#0A0A0A] selection:bg-[#0A0A0A] selection:text-[#F7F4EE] flex flex-col justify-between overflow-x-hidden">
        <div>
          <StorefrontHeader />
          <StorefrontBannerCarousel banners={banners} />
          <main>
            <StorefrontHero />
            <FeaturedProductsShowcase items={catalogItems} />
            <StorefrontCatalog items={catalogItems} stockItems={stockItems} />
          </main>
        </div>
        <StorefrontFooter />
        <StorefrontCartDrawer />
      </div>
    </CartProvider>
  );
}
