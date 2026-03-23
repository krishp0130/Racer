import type { Race, RaceCoordinates } from "@/types/ontology";
import { SYNTHETIC_DRIVERS, SYNTHETIC_VEHICLES } from "@/utils/seedData";

/**
 * Completed race row for analytics / AI matchmaking tests.
 * Extends Ontology `Race` with timestamps (not yet on core type).
 */
export type HistoricalRace = Race & {
  status: "finished";
  startTime: string;
  endTime: string;
};

const ELO_MIN = 500;
const ELO_MAX = 2500;
const HP_MIN = 200;
const HP_MAX = 1000;

/** Logistic steepness so a ~0.69 composite gap ⇒ ~90% win rate for the favorite. */
const WIN_LOGISTIC_K = 3.2;

const ELO_WEIGHT = 0.55;
const HP_WEIGHT = 0.45;

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/** 0–1 “strength” from vehicle + driver (higher = faster / more skilled). */
export function compositeStrength(
  eloRating: number,
  horsepower: number,
): number {
  const eloN = clamp01((eloRating - ELO_MIN) / (ELO_MAX - ELO_MIN));
  const hpN = clamp01((horsepower - HP_MIN) / (HP_MAX - HP_MIN));
  return ELO_WEIGHT * eloN + HP_WEIGHT * hpN;
}

/**
 * Probability that participant `a` beats `b` (0–1), from composite strength gap.
 */
export function winProbabilityForA(
  strengthA: number,
  strengthB: number,
): number {
  const delta = strengthA - strengthB;
  return 1 / (1 + Math.exp(-WIN_LOGISTIC_K * delta));
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const vehicleById = new Map(
  SYNTHETIC_VEHICLES.map((v) => [v.id, v] as const),
);

function vehicleForDriver(driverId: string) {
  const d = SYNTHETIC_DRIVERS.find((x) => x.id === driverId);
  if (!d) return undefined;
  return vehicleById.get(d.vehicleId);
}

/** Bearing degrees → offset in meters (north = 0°, east = 90°). */
function offsetFromStart(
  start: RaceCoordinates,
  bearingDeg: number,
  distanceMeters: number,
): RaceCoordinates {
  const rad = (bearingDeg * Math.PI) / 180;
  const latRad = (start.latitude * Math.PI) / 180;
  const metersPerDegLat = 111_320;
  const metersPerDegLng = 111_320 * Math.cos(latRad) || 1;
  const dLat = (distanceMeters * Math.cos(rad)) / metersPerDegLat;
  const dLng = (distanceMeters * Math.sin(rad)) / metersPerDegLng;
  return {
    latitude: start.latitude + dLat,
    longitude: start.longitude + dLng,
  };
}

/** Greater Los Angeles — plausible sprint / canyon endpoints. */
function randomStartCoords(rand: () => number): RaceCoordinates {
  const lat = 33.95 + rand() * 0.22;
  const lng = -118.55 + rand() * 0.35;
  return { latitude: lat, longitude: lng };
}

function randomRaceDurationMs(rand: () => number): number {
  const seconds = 8 + rand() * 82;
  return Math.round(seconds * 1000);
}

function randomPastStartMs(rand: () => number, maxDaysAgo: number): number {
  const span = maxDaysAgo * 24 * 60 * 60 * 1000;
  return Date.now() - Math.floor(rand() * span);
}

export type GenerateHistoryOptions = {
  count?: number;
  /** RNG seed for reproducible JSON exports */
  seed?: number;
  /** How far back `startTime` can be */
  maxDaysAgo?: number;
};

/**
 * Builds `count` finished head-to-head races with realistic coords, durations,
 * and win odds driven by Elo + horsepower (see `winProbabilityForA`).
 */
export function generateRaceHistory(
  options: GenerateHistoryOptions = {},
): HistoricalRace[] {
  const count = options.count ?? 500;
  const seed = options.seed ?? 42_001;
  const maxDaysAgo = options.maxDaysAgo ?? 180;
  const rand = mulberry32(seed);

  const drivers = SYNTHETIC_DRIVERS;
  if (drivers.length < 2) {
    throw new Error("Need at least two seed drivers for pairings");
  }

  const rows: HistoricalRace[] = [];

  for (let i = 0; i < count; i++) {
    let aIdx = Math.floor(rand() * drivers.length);
    let bIdx = Math.floor(rand() * drivers.length);
    while (bIdx === aIdx) {
      bIdx = Math.floor(rand() * drivers.length);
    }

    const da = drivers[aIdx]!;
    const db = drivers[bIdx]!;
    const va = vehicleForDriver(da.id);
    const vb = vehicleForDriver(db.id);
    if (!va || !vb) {
      throw new Error(`Missing vehicle for driver ${da.id} or ${db.id}`);
    }

    const sa = compositeStrength(da.eloRating, va.horsepower);
    const sb = compositeStrength(db.eloRating, vb.horsepower);
    const pA = winProbabilityForA(sa, sb);
    const winnerId = rand() < pA ? da.id : db.id;

    const startCoords = randomStartCoords(rand);
    const bearing = rand() * 360;
    const legMeters = 280 + rand() * 1520;
    const finishCoords = offsetFromStart(startCoords, bearing, legMeters);

    const startMs = randomPastStartMs(rand, maxDaysAgo);
    const durationMs = randomRaceDurationMs(rand);
    const endMs = startMs + durationMs;

    rows.push({
      id: `race-hist-${seed}-${i}`,
      status: "finished",
      participants: [da.id, db.id],
      startCoords,
      finishCoords,
      winnerId,
      startTime: new Date(startMs).toISOString(),
      endTime: new Date(endMs).toISOString(),
    });
  }

  return rows;
}

/** Pre-generated table (500 rows, seed 42001) for imports / Storybook / tests. */
export const MOCK_RACE_HISTORY_TABLE: HistoricalRace[] = generateRaceHistory({
  count: 500,
  seed: 42_001,
});

/** Serialize for fixtures, downloads, or mock HTTP bodies. */
export function raceHistoryToJson(rows: HistoricalRace[]): string {
  return JSON.stringify(rows, null, 2);
}

/** Pre-stringified `MOCK_RACE_HISTORY_TABLE` (compact, one line optional). */
export const MOCK_RACE_HISTORY_JSON: string = raceHistoryToJson(
  MOCK_RACE_HISTORY_TABLE,
);
