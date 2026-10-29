import type { Metadata } from "next";
import { Sora } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "sonner";
import { prisma } from "@/lib/prisma";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const justSerif = localFont({
  src: [
    {
      path: "../../public/fonts/JUSTSerif-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/JUSTSerif-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-just-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cordeiro Ink | Streetwear Autêntico & Estamparia Sob Demanda",
  description:
    "Marca de streetwear premium, camisetas oversized 100% algodão heavyweight e estamparia personalizada sob demanda.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Coleta dados em tempo real para os badges da navegação interna do ERP
  const [activeOrdersCount, inProductionCount, allRawItems] = await Promise.all([
    prisma.order.count({
      where: {
        status: { in: ["NEW", "PAID", "WAITING_PRODUCTION", "IN_PRODUCTION"] },
      },
    }),
    prisma.productionJob.count({
      where: {
        stepCompleted: false,
      },
    }),
    prisma.rawItem.findMany({
      select: { stockQuantity: true, minStock: true },
    }),
  ]);

  const criticalStockCount = allRawItems.filter(
    (i) => i.stockQuantity <= i.minStock
  ).length;

  return (
    <html lang="pt-BR" className={`${sora.variable} ${justSerif.variable}`}>
      <body className="font-sans antialiased min-h-screen">
        <AppShell
          activeOrdersCount={activeOrdersCount}
          inProductionCount={inProductionCount}
          criticalStockCount={criticalStockCount}
        >
          {children}
        </AppShell>

        <Toaster
          theme="dark"
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: "#18181b",
              border: "1px solid #27272a",
              color: "#f4f4f5",
            },
          }}
        />
      </body>
    </html>
  );
}
