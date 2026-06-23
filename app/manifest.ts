import type { MetadataRoute } from "next";
import { BRAND_LOGO_SRC, BRAND_NAME } from "@/lib/site";

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
        src: BRAND_LOGO_SRC,
        sizes: "598x215",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
