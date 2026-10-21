import { getCatalogItems, getLeadQuotes, getStorefrontBanners } from "@/actions/storefront";
import { VitrineAdminView } from "@/components/admin/vitrine/VitrineAdminView";

export const dynamic = "force-dynamic";

export default async function AdminVitrinePage() {
  const [items, leads, banners] = await Promise.all([
    getCatalogItems(true),
    getLeadQuotes(),
    getStorefrontBanners(true),
  ]);

  return (
    <VitrineAdminView
      initialItems={items}
      initialLeads={leads}
      initialBanners={banners}
    />
  );
}
