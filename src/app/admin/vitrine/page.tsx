import { getCatalogItems, getLeadQuotes } from "@/actions/storefront";
import { VitrineAdminView } from "@/components/admin/vitrine/VitrineAdminView";

export const dynamic = "force-dynamic";

export default async function AdminVitrinePage() {
  const [items, leads] = await Promise.all([
    getCatalogItems(true),
    getLeadQuotes(),
  ]);

  return <VitrineAdminView initialItems={items} initialLeads={leads} />;
}
