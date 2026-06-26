import { ImageResponse } from "next/og";
import { getPublicEventBySlug } from "@/lib/data/events";
import { getSafeEventImageUrl } from "@/lib/images";
import { formatEventDate, getLowestPrice } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/site";

export const alt = `${BRAND_NAME} event`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);

  if (!event) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#000",
            color: "#fff",
            fontSize: 64,
            fontWeight: 700,
          }}
        >
          {BRAND_NAME}
        </div>
      ),
      size,
    );
  }

  const posterUrl = getSafeEventImageUrl(event.heroImage ?? event.image);
  const lowest = getLowestPrice(event.tiers);
  const priceLabel =
    lowest == null
      ? ""
      : lowest === 0
        ? "Free entry"
        : `From R${lowest}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#000",
          color: "#fff",
        }}
      >
        <img
          src={posterUrl}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.25) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: 56,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "#c4f82a",
              }}
            >
              {BRAND_NAME}
            </div>
            <div style={{ fontSize: 22, color: "#d4d4d4" }}>
              {event.category}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: 64,
                fontWeight: 800,
                lineHeight: 1.05,
                maxWidth: 1000,
              }}
            >
              {event.title}
            </div>
            <div style={{ fontSize: 30, color: "#e5e5e5" }}>
              {formatEventDate(event.date)} · {event.venue.name},{" "}
              {event.venue.city}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: 26, color: "#d4d4d4" }}>
              {event.artists
                .slice(0, 3)
                .map((a) => a.name)
                .join("  ·  ")}
            </div>
            {priceLabel ? (
              <div
                style={{
                  display: "flex",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#000",
                  background: "#c4f82a",
                  padding: "10px 24px",
                  borderRadius: 999,
                }}
              >
                {priceLabel}
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
