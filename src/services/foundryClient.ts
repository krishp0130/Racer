import { haversineMeters, type LngLat } from "@/lib/geo";
import type { Driver, LiveTelemetry, Race, RaceStatus } from "@/types/ontology";

const RACE_STATUSES: RaceStatus[] = [
  "pending",
  "countdown",
  "active",
  "finished",
];

const STORAGE_PREFIX = "racer:foundry:" as const;

function storageKey(segment: string): string {
  return `${STORAGE_PREFIX}${segment}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function parseJson<T>(raw: string | null, fallback: T): T {
  if (raw == null || raw === "") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function newRaceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `race-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function completeRace(partial: Partial<Race>): Race {
  return {
    id: partial.id ?? newRaceId(),
    status: partial.status ?? "pending",
    participants: partial.participants ?? [],
    startCoords: partial.startCoords ?? { latitude: 0, longitude: 0 },
    finishCoords: partial.finishCoords ?? { latitude: 0, longitude: 0 },
    winnerId: partial.winnerId ?? null,
  };
}

function isRaceStatus(value: string): value is RaceStatus {
  return (RACE_STATUSES as string[]).includes(value);
}

/** Seeded demo drivers (Ontology `Driver` has no geometry; positions come from latest telemetry). */
const SEED_DRIVERS: Driver[] = [
  {
    id: "drv-seed-1",
    username: "NeonShift",
    vehicleId: "veh-opp-1",
    eloRating: 1420,
  },
  {
    id: "drv-seed-2",
    username: "GridRunner",
    vehicleId: "veh-seed-2",
    eloRating: 1385,
  },
  {
    id: "drv-seed-3",
    username: "AsphaltGhost",
    vehicleId: "veh-seed-3",
    eloRating: 1510,
  },
];

const SEED_TELEMETRY: LiveTelemetry[] = [
  {
    driverId: "drv-seed-1",
    latitude: 37.7789,
    longitude: -122.4274,
    speed: 0,
    heading: 90,
    timestamp: new Date().toISOString(),
  },
  {
    driverId: "drv-seed-2",
    latitude: 37.7812,
    longitude: -122.411,
    speed: 12,
    heading: 180,
    timestamp: new Date().toISOString(),
  },
  {
    driverId: "drv-seed-3",
    latitude: 37.7695,
    longitude: -122.432,
    speed: 8,
    heading: 45,
    timestamp: new Date().toISOString(),
  },
];

/**
 * Facade for Palantir Foundry Ontology access. Swap internals for generated OSDK client calls.
 */
export class FoundryClient {
  private readonly drivers = new Map<string, Driver>();

  private readonly races = new Map<string, Race>();

  /** Latest telemetry per driver (Ontology may model this as `LiveTelemetry` object set or links). */
  private readonly telemetryByDriver = new Map<string, LiveTelemetry>();

  constructor() {
    this.hydrate();
    if (this.drivers.size === 0) {
      this.seed();
    }
  }

  private hydrate(): void {
    if (!isBrowser()) return;

    const driversArr = parseJson<Driver[]>(
      localStorage.getItem(storageKey("drivers")),
      [],
    );
    for (const d of driversArr) {
      this.drivers.set(d.id, d);
    }

    const racesArr = parseJson<Race[]>(
      localStorage.getItem(storageKey("races")),
      [],
    );
    for (const r of racesArr) {
      this.races.set(r.id, r);
    }

    const telemArr = parseJson<LiveTelemetry[]>(
      localStorage.getItem(storageKey("telemetry")),
      [],
    );
    for (const t of telemArr) {
      this.telemetryByDriver.set(t.driverId, t);
    }
  }

  private persist(): void {
    if (!isBrowser()) return;
    try {
      localStorage.setItem(
        storageKey("drivers"),
        JSON.stringify([...this.drivers.values()]),
      );
      localStorage.setItem(
        storageKey("races"),
        JSON.stringify([...this.races.values()]),
      );
      localStorage.setItem(
        storageKey("telemetry"),
        JSON.stringify([...this.telemetryByDriver.values()]),
      );
    } catch {
      /* quota / private mode — in-memory still valid */
    }
  }

  private seed(): void {
    for (const d of SEED_DRIVERS) {
      this.drivers.set(d.id, d);
    }
    for (const t of SEED_TELEMETRY) {
      this.telemetryByDriver.set(t.driverId, t);
    }
    this.persist();
  }

  /**
   * Upsert live telemetry for a driver (streaming pipeline → Ontology object or time-series).
   */
  async updateTelemetry(telemetry: LiveTelemetry): Promise<void> {
    // TODO: Replace with Palantir OSDK call, e.g.:
    // await client(LiveTelemetry).createOrUpdate(telemetry)
    // or Actions API: client.actions.updateDriverTelemetry({ ...telemetry })
    this.telemetryByDriver.set(telemetry.driverId, { ...telemetry });
    this.persist();
  }

  /**
   * Create a race object in the Ontology; returns the primary key / RID.
   */
  async createRaceEvent(race: Partial<Race>): Promise<string> {
    // TODO: Replace with Palantir OSDK call, e.g.:
    // const created = await client(Race).create({
    //   ...completeRace(race),
    // });
    // return created.$primaryKey;
    const full = completeRace(race);
    if (this.races.has(full.id)) {
      throw new Error(`Race already exists: ${full.id}`);
    }
    this.races.set(full.id, full);
    this.persist();
    return full.id;
  }

  /**
   * Transition race workflow state (often backed by an Action or direct object edit).
   */
  async updateRaceState(raceId: string, state: string): Promise<void> {
    // TODO: Replace with Palantir OSDK call, e.g.:
    // await client(Race).fetchOneWithErrors(raceId).patch({ status: state as RaceStatus })
    // or: await client.actions.transitionRace({ raceId, nextStatus: state })
    if (!isRaceStatus(state)) {
      throw new Error(
        `Invalid race state "${state}". Expected one of: ${RACE_STATUSES.join(", ")}`,
      );
    }
    const race = this.races.get(raceId);
    if (!race) {
      throw new Error(`Race not found: ${raceId}`);
    }
    this.races.set(raceId, { ...race, status: state });
    this.persist();
  }

  /**
   * Geo query: drivers with recent telemetry within `radiusMeters` of the point.
   * (Production: Ontology geo query, FDE search, or pipeline-maintained spatial index.)
   */
  async getNearbyDrivers(
    lat: number,
    lng: number,
    radius: number,
  ): Promise<Driver[]> {
    // TODO: Replace with Palantir OSDK / Foundry API geo query, e.g.:
    // return client(Driver).search().nearby({ latitude: lat, longitude: lng, radiusMeters: radius })
    // or a custom Function-backed endpoint that returns Driver[].
    const origin: LngLat = { latitude: lat, longitude: lng };
    const out: Driver[] = [];

    for (const [driverId, telem] of this.telemetryByDriver) {
      const dM = haversineMeters(origin, {
        latitude: telem.latitude,
        longitude: telem.longitude,
      });
      if (dM > radius) continue;

      const driver = this.drivers.get(driverId);
      if (driver) {
        out.push(driver);
      }
    }

    return out.sort((a, b) => a.username.localeCompare(b.username));
  }
}

/** Shared app instance; replace binding when wiring OSDK client factory / auth. */
export const foundryClient = new FoundryClient();
