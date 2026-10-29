import { getCatalogItems, getLeadQuotes, getStorefrontBanners } from "@/actions/storefront";
import { getProductTemplates } from "@/actions/templates";
import { VitrineAdminView } from "@/components/admin/vitrine/VitrineAdminView";

export const dynamic = "force-dynamic";

export default async function AdminVitrinePage() {
  const [items, leads, banners, templates] = await Promise.all([
    getCatalogItems(true),
    getLeadQuotes(),
    getStorefrontBanners(true),
    getProductTemplates(),
  ]);

  return (
    <VitrineAdminView
      initialItems={items}
      initialLeads={leads}
      initialBanners={banners}
      initialTemplates={templates}
    />
  );
}
