import { haversineMeters, type LngLat } from "@/lib/geo";
import type { Driver, LiveTelemetry } from "@/types/ontology";
import { SYNTHETIC_DRIVERS } from "@/utils/seedData";

/** Downtown Los Angeles — approximate civic center. */
export const DEFAULT_LA_CENTER = {
  latitude: 34.052235,
  longitude: -118.243683,
} as const;

export type RoutePoint = LngLat;

/** One telemetry sample for a single driver (Ontology-aligned). */
export type TelemetryUpdate = LiveTelemetry;

/** Full snapshot after each simulation tick (all drivers). */
export type TelemetryTickPayload = {
  /** ISO time when this tick was computed */
  tickAt: string;
  /** Latest telemetry per `driverId` */
  telemetryByDriverId: Record<string, LiveTelemetry>;
};

export type TelemetryListener = (payload: TelemetryTickPayload) => void;

/** Deterministic PRNG from string (stable routes per driver id). */
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Bearing from `from` → `to` in degrees clockwise from north (0–360). */
export function bearingDegrees(from: LngLat, to: LngLat): number {
  const φ1 = (from.latitude * Math.PI) / 180;
  const φ2 = (to.latitude * Math.PI) / 180;
  const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return ((θ * 180) / Math.PI + 360) % 360;
}

/** Convert meters traveled in `dtSeconds` to mph. */
function speedMph(distanceMeters: number, dtSeconds: number): number {
  if (dtSeconds <= 0) return 0;
  const mps = distanceMeters / dtSeconds;
  return mps * 2.2369362920544;
}

export type GenerateRouteOptions = {
  center: LngLat;
  /** Defaults to 50 */
  pointCount?: number;
  /** Seed string for reproducible geometry (e.g. driver id) */
  seed: string;
  /** Max distance from center in meters (urban grid ~1.5–2.5 km) */
  maxRadiusMeters?: number;
};

/**
 * Builds a plausible urban loop: biased random walk with soft pull toward center
 * so paths stay in a downtown-sized area.
 */
export function generateRoute(options: GenerateRouteOptions): RoutePoint[] {
  const {
    center,
    pointCount = 50,
    seed,
    maxRadiusMeters = 2200,
  } = options;

  const rand = mulberry32(hashSeed(seed));
  const route: RoutePoint[] = [];

  const startAngle = rand() * Math.PI * 2;
  const startDist = (0.25 + rand() * 0.55) * maxRadiusMeters;
  const metersPerDegLat = 111_320;
  const metersPerDegLng =
    111_320 * Math.cos((center.latitude * Math.PI) / 180) || 1;

  let lat =
    center.latitude + (startDist * Math.cos(startAngle)) / metersPerDegLat;
  let lng =
    center.longitude +
    (startDist * Math.sin(startAngle)) / metersPerDegLng;

  let headingRad =
    (startAngle + Math.PI / 2 + (rand() - 0.5) * 0.8) % (Math.PI * 2);

  for (let i = 0; i < pointCount; i++) {
    route.push({ latitude: lat, longitude: lng });

    const stepM = 35 + rand() * 95;
    headingRad += (rand() - 0.5) * 0.55;

    lat += (Math.cos(headingRad) * stepM) / metersPerDegLat;
    lng += (Math.sin(headingRad) * stepM) / metersPerDegLng;

    const distFromCenter = haversineMeters(center, { latitude: lat, longitude: lng });
    if (distFromCenter > maxRadiusMeters) {
      const pull = Math.min(0.45, (distFromCenter - maxRadiusMeters) / distFromCenter);
      lat += (center.latitude - lat) * pull;
      lng += (center.longitude - lng) * pull;
      headingRad += Math.PI * 0.35 * (rand() > 0.5 ? 1 : -1);
    }
  }

  // Close the loop so wrap 49→0 is a short, realistic segment for simulation.
  const first = route[0]!;
  route[pointCount - 1] = {
    latitude: first.latitude,
    longitude: first.longitude,
  };

  return route;
}

const DEFAULT_SUBSET_SIZE = 10;

export type TelemetryEngineOptions = {
  /** Drivers to simulate; default: first 10 from `SYNTHETIC_DRIVERS` */
  drivers?: Driver[];
  center?: LngLat;
  /** Coordinates per route (default 50) */
  routePointCount?: number;
  /** Tick interval in ms (default 1000) */
  intervalMs?: number;
};

/**
 * Simulates live `LiveTelemetry` for a small driver set by walking generated routes
 * around a central point (default: downtown LA).
 */
export class TelemetryEngine {
  private readonly drivers: Driver[];

  private readonly center: LngLat;

  private readonly routePointCount: number;

  private readonly intervalMs: number;

  private readonly routes = new Map<string, RoutePoint[]>();

  /** Current vertex index in each driver’s route (position shown on last tick). */
  private readonly indexByDriver = new Map<string, number>();

  private intervalId: ReturnType<typeof setInterval> | null = null;

  private readonly hasEmittedByDriver = new Map<string, boolean>();

  private readonly listeners = new Set<TelemetryListener>();

  constructor(options: TelemetryEngineOptions = {}) {
    this.drivers =
      options.drivers ?? SYNTHETIC_DRIVERS.slice(0, DEFAULT_SUBSET_SIZE);
    this.center = options.center ?? { ...DEFAULT_LA_CENTER };
    this.routePointCount = options.routePointCount ?? 50;
    this.intervalMs = options.intervalMs ?? 1000;

    for (const d of this.drivers) {
      this.routes.set(
        d.id,
        generateRoute({
          center: this.center,
          pointCount: this.routePointCount,
          seed: d.id,
        }),
      );
      this.indexByDriver.set(d.id, 0);
      this.hasEmittedByDriver.set(d.id, false);
    }
  }

  getDrivers(): readonly Driver[] {
    return this.drivers;
  }

  getRoute(driverId: string): RoutePoint[] | undefined {
    return this.routes.get(driverId);
  }

  /** Subscribe to every simulation tick; returns unsubscribe. */
  subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(payload: TelemetryTickPayload): void {
    for (const fn of this.listeners) {
      try {
        fn(payload);
      } catch {
        /* isolate listener errors */
      }
    }
  }

  /**
   * Advance all drivers one step and push telemetry (speed from segment length / tick duration).
   */
  private tick(): void {
    const tickAt = new Date().toISOString();
    const dtSec = this.intervalMs / 1000;
    const telemetryByDriverId: Record<string, LiveTelemetry> = {};

    for (const driver of this.drivers) {
      const route = this.routes.get(driver.id);
      if (!route?.length) continue;

      const n = route.length;
      const idx = this.indexByDriver.get(driver.id) ?? 0;
      const here = route[idx]!;
      const prevIdx = (idx - 1 + n) % n;
      const prev = route[prevIdx]!;
      const nextIdx = (idx + 1) % n;
      const next = route[nextIdx]!;

      const hasEmitted = this.hasEmittedByDriver.get(driver.id) ?? false;
      let speed: number;
      let heading: number;

      if (!hasEmitted) {
        speed = 0;
        heading = bearingDegrees(here, next);
      } else {
        const dist = haversineMeters(prev, here);
        speed = speedMph(dist, dtSec);
        heading = bearingDegrees(prev, here);
      }

      telemetryByDriverId[driver.id] = {
        driverId: driver.id,
        latitude: here.latitude,
        longitude: here.longitude,
        speed,
        heading,
        timestamp: tickAt,
      };

      this.hasEmittedByDriver.set(driver.id, true);
      this.indexByDriver.set(driver.id, nextIdx);
    }

    this.emit({ tickAt, telemetryByDriverId });
  }

  /** Start emitting telemetry every `intervalMs` (default 1s). Idempotent: restarts timer and route progress. */
  startSimulation(): void {
    this.stopSimulation();
    for (const d of this.drivers) {
      this.indexByDriver.set(d.id, 0);
      this.hasEmittedByDriver.set(d.id, false);
    }
    this.intervalId = setInterval(() => this.tick(), this.intervalMs);
    this.tick();
  }

  stopSimulation(): void {
    if (this.intervalId != null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /** Whether `startSimulation` is active. */
  isRunning(): boolean {
    return this.intervalId != null;
  }
}
