"use client";

import { useMemo } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from "react-leaflet";
import type { Event } from "@/lib/types";
import { CITY_COORDS, SA_CENTER } from "@/lib/data/city-coords";
import { formatEventDate, formatPrice, getLowestPrice } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

type EventsMapProps = {
  events: Event[];
};

type CityCluster = {
  city: string;
  lat: number;
  lng: number;
  events: Event[];
};

export function EventsMap({ events }: EventsMapProps) {
  const clusters = useMemo<CityCluster[]>(() => {
    const byCity = new Map<string, CityCluster>();
    for (const event of events) {
      const coords = CITY_COORDS[event.venue.city];
      if (!coords) continue;
      const existing = byCity.get(event.venue.city);
      if (existing) {
        existing.events.push(event);
      } else {
        byCity.set(event.venue.city, {
          city: event.venue.city,
          lat: coords.lat,
          lng: coords.lng,
          events: [event],
        });
      }
    }
    return [...byCity.values()];
  }, [events]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <MapContainer
        center={[SA_CENTER.lat, SA_CENTER.lng]}
        zoom={5}
        scrollWheelZoom={false}
        style={{ height: "70vh", width: "100%", background: "#0c0c0c" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {clusters.map((cluster) => {
          const radius = Math.min(28, 10 + cluster.events.length * 3);
          return (
            <CircleMarker
              key={cluster.city}
              center={[cluster.lat, cluster.lng]}
              radius={radius}
              pathOptions={{
                color: "#c4f82a",
                fillColor: "#c4f82a",
                fillOpacity: 0.35,
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -radius]}>
                {cluster.city} · {cluster.events.length} event
                {cluster.events.length !== 1 ? "s" : ""}
              </Tooltip>
              <Popup>
                <div className="min-w-[200px] space-y-2">
                  <p className="text-sm font-semibold text-black">
                    {cluster.city}
                  </p>
                  <ul className="space-y-1.5">
                    {cluster.events.slice(0, 5).map((event) => {
                      const price = getLowestPrice(event.tiers);
                      return (
                        <li key={event.slug}>
                          <Link
                            href={`/events/${event.slug}`}
                            className="block text-xs text-black hover:underline"
                          >
                            <span className="font-medium">{event.title}</span>
                            <span className="block text-[11px] text-neutral-600">
                              {formatEventDate(event.date)}
                              {price != null
                                ? ` · ${price === 0 ? "Free" : `from ${formatPrice(price)}`}`
                                : ""}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  {cluster.events.length > 5 && (
                    <p className="text-[11px] text-neutral-600">
                      +{cluster.events.length - 5} more
                    </p>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
