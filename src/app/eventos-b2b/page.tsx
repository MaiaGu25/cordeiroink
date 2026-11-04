import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { CustomOrderSection } from "@/components/storefront/CustomOrderSection";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { CartProvider } from "@/components/storefront/CartContext";
import { StorefrontCartDrawer } from "@/components/storefront/StorefrontCartDrawer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Eventos B2B | Cordeiro Ink",
  description: "Camisetas personalizadas e estamparia em alta gramatura para igrejas, conferências, congressos e marcas.",
};

export default function EventosB2BPage() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-[#F7F4EE] text-[#0A0A0A] selection:bg-[#0A0A0A] selection:text-[#F7F4EE] flex flex-col justify-between overflow-x-hidden">
        <div>
          <StorefrontHeader />
          <main className="py-6 sm:py-10">
            <CustomOrderSection />
          </main>
        </div>
        <StorefrontFooter />
        <StorefrontCartDrawer />
      </div>
    </CartProvider>
  );
}
