/** Approximate lat/lng for South African cities used in event discovery maps. */
export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Johannesburg: { lat: -26.2041, lng: 28.0473 },
  "Cape Town": { lat: -33.9249, lng: 18.4241 },
  Durban: { lat: -29.8587, lng: 31.0218 },
  Pretoria: { lat: -25.7479, lng: 28.2293 },
  Gqeberha: { lat: -33.9608, lng: 25.6022 },
  Stellenbosch: { lat: -33.9321, lng: 18.8602 },
  Soweto: { lat: -26.2678, lng: 27.8585 },
  Sandton: { lat: -26.1076, lng: 28.0567 },
  Midrand: { lat: -25.9992, lng: 28.1263 },
  Centurion: { lat: -25.8603, lng: 28.1894 },
  Roodepoort: { lat: -26.1625, lng: 27.8725 },
  Benoni: { lat: -26.1885, lng: 28.3208 },
  Vereeniging: { lat: -26.6731, lng: 27.9261 },
  George: { lat: -33.963, lng: 22.4617 },
  Paarl: { lat: -33.7342, lng: 18.9621 },
  Hermanus: { lat: -34.4187, lng: 19.2345 },
  "Somerset West": { lat: -34.0847, lng: 18.8489 },
  Knysna: { lat: -34.0363, lng: 23.0471 },
  "Mossel Bay": { lat: -34.1831, lng: 22.146 },
  Pietermaritzburg: { lat: -29.6006, lng: 30.3794 },
  "Richards Bay": { lat: -28.7807, lng: 32.0383 },
  Newcastle: { lat: -27.7457, lng: 29.9318 },
  Umhlanga: { lat: -29.7264, lng: 31.0843 },
  "East London": { lat: -33.0292, lng: 27.8546 },
  Makhanda: { lat: -33.3107, lng: 26.5219 },
  Mthatha: { lat: -31.5889, lng: 28.7844 },
  Bloemfontein: { lat: -29.0852, lng: 26.1596 },
  Welkom: { lat: -27.9869, lng: 26.7136 },
  Mbombela: { lat: -25.4753, lng: 30.9694 },
  eMalahleni: { lat: -25.877, lng: 29.2 },
  Secunda: { lat: -26.5167, lng: 29.2 },
  Polokwane: { lat: -23.9045, lng: 29.4689 },
  Tzaneen: { lat: -23.8333, lng: 30.1667 },
  Rustenburg: { lat: -25.6672, lng: 27.2424 },
  Mahikeng: { lat: -25.865, lng: 25.6443 },
  Klerksdorp: { lat: -26.8521, lng: 26.6667 },
  Kimberley: { lat: -28.7282, lng: 24.7499 },
  Upington: { lat: -28.4478, lng: 21.2561 },
};

/** Geographic centre of South Africa, used as the default map view. */
export const SA_CENTER = { lat: -29.0, lng: 25.0 };

export function getCityCoords(
  city: string,
): { lat: number; lng: number } | null {
  return CITY_COORDS[city] ?? null;
}
