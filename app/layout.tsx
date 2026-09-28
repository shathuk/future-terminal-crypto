import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/navigation/BottomNav";
import OfflineBanner from "@/components/ui/OfflineBanner";
import SwRegister from "@/components/ui/SwRegister";
import MarketProvider from "@/components/quotes/MarketProvider";

export const metadata: Metadata = {
  title: "Binance Futures Terminal",
  applicationName: "Binance Futures Terminal",
  description: "Personal Binance USDT-M Futures trading terminal",
  manifest: "/manifest.json",
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" },
  appleWebApp: { capable: true, title: "Futures Terminal", statusBarStyle: "black-translucent" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0d1117" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MarketProvider>
        <OfflineBanner />
        <div className="mx-auto min-h-screen max-w-3xl pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0 md:pl-20">{children}</div>
        <BottomNav />
        <SwRegister />
        </MarketProvider>
      </body>
    </html>
  );
}
