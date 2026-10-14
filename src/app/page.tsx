import { getCatalogItems } from "@/actions/storefront";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontHero } from "@/components/storefront/StorefrontHero";
import { StorefrontCatalog } from "@/components/storefront/StorefrontCatalog";
import { CustomOrderSection } from "@/components/storefront/CustomOrderSection";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";

export const dynamic = "force-dynamic";

export default async function StorefrontPage() {
  const catalogItems = await getCatalogItems(false);

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#0A0A0A] selection:bg-[#0A0A0A] selection:text-[#F7F4EE] flex flex-col justify-between">
      <div>
        <StorefrontHeader />
        <main>
          <StorefrontHero />
          <StorefrontCatalog items={catalogItems} />
          <CustomOrderSection />
        </main>
      </div>
      <StorefrontFooter />
    </div>
  );
}
