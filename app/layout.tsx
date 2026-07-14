import type { Metadata } from "next";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/components/CartContext";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Uncle Jeff's",
    template: "%s | Uncle Jeff's",
  },
  description:
    "Vintage French workwear, militaria, and garments with a life behind them.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Nav />
          <AnnouncementBanner />
          <main>{children}</main>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
