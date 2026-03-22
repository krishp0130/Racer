export type LngLat = { longitude: number; latitude: number };

export function haversineMeters(a: LngLat, b: LngLat): number {
  const R = 6371000;
  const φ1 = (a.latitude * Math.PI) / 180;
  const φ2 = (b.latitude * Math.PI) / 180;
  const Δφ = ((b.latitude - a.latitude) * Math.PI) / 180;
  const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180;
  const s =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function interpolateToward(
  from: LngLat,
  to: LngLat,
  meters: number,
): LngLat {
  const dist = haversineMeters(from, to);
  if (dist <= meters) return { ...to };
  const f = meters / dist;
  return {
    longitude: from.longitude + (to.longitude - from.longitude) * f,
    latitude: from.latitude + (to.latitude - from.latitude) * f,
  };
}

export function metersToMiles(m: number): number {
  return m / 1609.344;
}
