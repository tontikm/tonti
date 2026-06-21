import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tonti — Live Music Tickets",
    short_name: "Tonti",
    description:
      "Discover and book tickets to the best live music in South Africa. Your tickets work offline at the door.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    categories: ["music", "events", "entertainment"],
    icons: [
      {
        src: "/tonti-logo.png",
        sizes: "598x215",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
