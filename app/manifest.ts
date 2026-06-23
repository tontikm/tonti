import type { MetadataRoute } from "next";
import { BRAND_ICON_SQUARE_SRC, BRAND_ICON_SRC, BRAND_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND_NAME} | Live Music Tickets`,
    short_name: BRAND_NAME,
    description:
      "Discover and book tickets to the best live music in South Africa. Your tickets work offline at the door.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    categories: ["music", "events", "entertainment"],
    icons: [
      {
        src: BRAND_ICON_SQUARE_SRC,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: BRAND_ICON_SQUARE_SRC,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/spotra-icon-square.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
