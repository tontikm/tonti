import { ImageResponse } from "next/og";
import { getPublicEventBySlug } from "@/lib/data/events";
import { formatEventDate, getLowestPrice } from "@/lib/utils";

export const alt = "Tonti event";
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
          Tonti
        </div>
      ),
      size,
    );
  }

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
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000",
          padding: 72,
          color: "#fff",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(900px 500px at 85% -10%, rgba(196,248,42,0.18), transparent)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#c4f82a",
            }}
          >
            Tonti
          </div>
          <div style={{ fontSize: 24, color: "#a3a3a3" }}>
            {event.category}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              maxWidth: 1000,
            }}
          >
            {event.title}
          </div>
          <div style={{ fontSize: 34, color: "#d4d4d4" }}>
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
          <div style={{ fontSize: 30, color: "#a3a3a3" }}>
            {event.artists
              .slice(0, 3)
              .map((a) => a.name)
              .join("  ·  ")}
          </div>
          {priceLabel ? (
            <div
              style={{
                display: "flex",
                fontSize: 32,
                fontWeight: 700,
                color: "#000",
                background: "#c4f82a",
                padding: "12px 28px",
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
    ),
    size,
  );
}
