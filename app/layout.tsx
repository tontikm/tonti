import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import { ConditionalSiteChrome } from "@/components/layout/ConditionalSiteChrome";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EventBrandProvider } from "@/components/layout/EventBrandProvider";
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
    default: "Tonti — Live Music Tickets in South Africa",
    template: "%s | Tonti",
  },
  description:
    "Discover and book tickets to the best live music in South Africa. Concerts, festivals, and club nights — music only.",
  keywords: [
    "tickets",
    "concerts",
    "live music",
    "South Africa",
    "festivals",
    "amapiano",
  ],
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
          <ConditionalSiteChrome header={<Header />} footer={<Footer />}>
            {children}
          </ConditionalSiteChrome>
        </EventBrandProvider>
      </body>
    </html>
  );
}
