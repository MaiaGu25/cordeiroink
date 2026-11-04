import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { AboutSection } from "@/components/storefront/AboutSection";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { CartProvider } from "@/components/storefront/CartContext";
import { StorefrontCartDrawer } from "@/components/storefront/StorefrontCartDrawer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quem Somos | Cordeiro Ink",
  description: "Conheça a história e o propósito por trás do ateliê Cordeiro Ink com Igor e Grazi.",
};

export default function QuemSomosPage() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-[#F7F4EE] text-[#0A0A0A] selection:bg-[#0A0A0A] selection:text-[#F7F4EE] flex flex-col justify-between overflow-x-hidden">
        <div>
          <StorefrontHeader />
          <main className="py-6 sm:py-12">
            <AboutSection />
          </main>
        </div>
        <StorefrontFooter />
        <StorefrontCartDrawer />
      </div>
    </CartProvider>
  );
}
