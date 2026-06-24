import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Basket",
};

export default function BasketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
