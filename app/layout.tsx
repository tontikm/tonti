import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import { ConditionalSiteChrome } from "@/components/layout/ConditionalSiteChrome";
import { BasketProvider } from "@/components/basket/BasketProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EventBrandProvider } from "@/components/layout/EventBrandProvider";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";
import { FanSessionIdleWatcher } from "@/components/auth/FanSessionIdleWatcher";
import { BRAND_NAME } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND_NAME} | Live Music Tickets in South Africa`,
    template: `%s | ${BRAND_NAME}`,
  },
  description:
    "Discover and book tickets to the best live music in South Africa. Concerts, festivals, and club nights. Music only.",
  keywords: [
    "tickets",
    "concerts",
    "live music",
    "South Africa",
    "festivals",
    "amapiano",
  ],
  appleWebApp: {
    capable: true,
    title: BRAND_NAME,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${pressStart.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <EventBrandProvider>
          <BasketProvider>
            <ConditionalSiteChrome header={<Header />} footer={<Footer />}>
              {children}
            </ConditionalSiteChrome>
          </BasketProvider>
        </EventBrandProvider>
        <ServiceWorkerRegistrar />
        <FanSessionIdleWatcher />
      </body>
    </html>
  );
}
