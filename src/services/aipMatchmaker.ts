import type { Driver, Vehicle } from "@/types/ontology";
import type { LngLat } from "@/lib/geo";

/** Mock Ontology-aligned vehicles for matchmaking demos. */
export const MATCHMAKER_VEHICLES: Vehicle[] = [
  {
    id: "veh-porsche-gt3",
    make: "Porsche",
    model: "911 GT3",
    year: 2022,
    horsepower: 502,
    class: "GT",
  },
  {
    id: "veh-gr86",
    make: "Toyota",
    model: "GR86",
    year: 2023,
    horsepower: 228,
    class: "Sports",
  },
  {
    id: "veh-civic-tr",
    make: "Honda",
    model: "Civic Type R",
    year: 2023,
    horsepower: 315,
    class: "Hot hatch",
  },
  {
    id: "veh-370z",
    make: "Nissan",
    model: "370Z",
    year: 2019,
    horsepower: 332,
    class: "Sports",
  },
  {
    id: "veh-mx5",
    make: "Mazda",
    model: "MX-5 Miata",
    year: 2022,
    horsepower: 181,
    class: "Roadster",
  },
  {
    id: "veh-m3",
    make: "BMW",
    model: "M3 Competition",
    year: 2022,
    horsepower: 503,
    class: "Sedan",
  },
  {
    id: "veh-mustang",
    make: "Ford",
    model: "Mustang GT",
    year: 2021,
    horsepower: 450,
    class: "Muscle",
  },
  {
    id: "veh-corvette",
    make: "Chevrolet",
    model: "Corvette Stingray",
    year: 2023,
    horsepower: 495,
    class: "Sports",
  },
];

/** Mock drivers; `vehicleId` links into `MATCHMAKER_VEHICLES`. */
export const MATCHMAKER_DRIVERS: Driver[] = [
  {
    id: "drv-neon",
    username: "NeonShift",
    vehicleId: "veh-porsche-gt3",
    eloRating: 1510,
  },
  {
    id: "drv-touge",
    username: "TougeGhost",
    vehicleId: "veh-gr86",
    eloRating: 1390,
  },
  {
    id: "drv-vtec",
    username: "VtecKick",
    vehicleId: "veh-civic-tr",
    eloRating: 1445,
  },
  {
    id: "drv-zed",
    username: "ZedRunner",
    vehicleId: "veh-370z",
    eloRating: 1360,
  },
  {
    id: "drv-miata",
    username: "HairpinHero",
    vehicleId: "veh-mx5",
    eloRating: 1320,
  },
  {
    id: "drv-bimmer",
    username: "RingRat",
    vehicleId: "veh-m3",
    eloRating: 1540,
  },
  {
    id: "drv-stang",
    username: "StraightLine",
    vehicleId: "veh-mustang",
    eloRating: 1410,
  },
  {
    id: "drv-vette",
    username: "MidEngine",
    vehicleId: "veh-corvette",
    eloRating: 1580,
  },
];

const JDM_MAKES = new Set(
  [
    "toyota",
    "honda",
    "nissan",
    "mazda",
    "subaru",
    "mitsubishi",
    "lexus",
    "acura",
    "infiniti",
    "suzuki",
  ].map((s) => s.toLowerCase()),
);

const GERMAN_MAKES = new Set(
  ["bmw", "mercedes", "porsche", "audi", "volkswagen", "vw"].map((s) =>
    s.toLowerCase(),
  ),
);

const AMERICAN_MAKES = new Set(
  [
    "ford",
    "chevrolet",
    "chevy",
    "dodge",
    "cadillac",
    "corvette",
    "jeep",
    "tesla",
  ].map((s) => s.toLowerCase()),
);

function normMake(make: string): string {
  return make.trim().toLowerCase();
}

function isJdmVehicle(v: Vehicle): boolean {
  return JDM_MAKES.has(normMake(v.make));
}

function isGermanVehicle(v: Vehicle): boolean {
  return GERMAN_MAKES.has(normMake(v.make));
}

function isAmericanVehicle(v: Vehicle): boolean {
  return AMERICAN_MAKES.has(normMake(v.make));
}

function vehicleById(id: string): Vehicle | undefined {
  return MATCHMAKER_VEHICLES.find((v) => v.id === id);
}

export type AipMatchResult = {
  driver: Driver;
  vehicle: Vehicle;
  /** Marker position for the Radar map */
  mapPosition: LngLat;
  /** Heuristic confidence for UI/debug */
  score: number;
};

export type OpponentBundle = {
  username: string;
  vehicle: Vehicle;
  position: LngLat;
  driverId: string;
};

const MAP_ANCHOR: LngLat = {
  longitude: -122.4194,
  latitude: 37.7749,
};

/** Stable offsets per driver so markers do not stack. */
const DRIVER_OFFSETS: Record<string, LngLat> = {
  "drv-neon": { longitude: 0.008, latitude: 0.004 },
  "drv-touge": { longitude: 0.005, latitude: -0.003 },
  "drv-vtec": { longitude: -0.006, latitude: 0.005 },
  "drv-zed": { longitude: 0.011, latitude: -0.002 },
  "drv-miata": { longitude: -0.009, latitude: -0.004 },
  "drv-bimmer": { longitude: 0.003, latitude: 0.008 },
  "drv-stang": { longitude: -0.011, latitude: 0.003 },
  "drv-vette": { longitude: 0.014, latitude: 0.006 },
};

function positionForDriver(driverId: string): LngLat {
  const d = DRIVER_OFFSETS[driverId] ?? {
    longitude: 0.007,
    latitude: 0.003,
  };
  return {
    longitude: MAP_ANCHOR.longitude + d.longitude,
    latitude: MAP_ANCHOR.latitude + d.latitude,
  };
}

export function bundleFromMatch(result: AipMatchResult): OpponentBundle {
  return {
    driverId: result.driver.id,
    username: result.driver.username,
    vehicle: result.vehicle,
    position: result.mapPosition,
  };
}

/** Default radar opponent (legacy demo). */
export function getDefaultOpponentBundle(): OpponentBundle {
  const driver = MATCHMAKER_DRIVERS.find((d) => d.id === "drv-neon")!;
  const vehicle = vehicleById(driver.vehicleId)!;
  return {
    driverId: driver.id,
    username: driver.username,
    vehicle,
    position: positionForDriver(driver.id),
  };
}

type ParsedIntent = {
  maxHp?: number;
  minHp?: number;
  jdm?: boolean;
  german?: boolean;
  american?: boolean;
};

function parseIntent(text: string): ParsedIntent {
  const t = text.toLowerCase();
  const intent: ParsedIntent = {};

  const under =
    t.match(/under\s*(\d+)\s*(?:hp|horsepower|bhp)/) ||
    t.match(/less\s*than\s*(\d+)\s*(?:hp|horsepower|bhp)/) ||
    t.match(/below\s*(\d+)\s*(?:hp|horsepower|bhp)/);
  if (under) intent.maxHp = Number(under[1]);

  const over =
    t.match(/over\s*(\d+)\s*(?:hp|horsepower|bhp)/) ||
    t.match(/more\s*than\s*(\d+)\s*(?:hp|horsepower|bhp)/) ||
    t.match(/above\s*(\d+)\s*(?:hp|horsepower|bhp)/);
  if (over) intent.minHp = Number(over[1]);

  if (/\bjdm\b|japanese|import\s*tuner|tokyo|touge/i.test(t)) intent.jdm = true;
  if (/\bgerman\b|deutsch|autobahn|nürburgring|nurburgring/i.test(t))
    intent.german = true;
  if (/\bamerican\b|\busa\b|muscle|detroit|domestic\b/i.test(t))
    intent.american = true;

  return intent;
}

function scoreCandidate(
  driver: Driver,
  vehicle: Vehicle,
  intent: ParsedIntent,
): number {
  let score = 50 + driver.eloRating * 0.01;

  if (intent.maxHp !== undefined) {
    if (vehicle.horsepower <= intent.maxHp) {
      score += 80;
      score += Math.max(0, intent.maxHp - vehicle.horsepower) * 0.05;
    } else {
      score -= 200;
    }
  }

  if (intent.minHp !== undefined) {
    if (vehicle.horsepower >= intent.minHp) score += 60;
    else score -= 120;
  }

  const regions = [intent.jdm, intent.german, intent.american].filter(Boolean);
  if (regions.length > 0) {
    if (intent.jdm && isJdmVehicle(vehicle)) score += 100;
    if (intent.german && isGermanVehicle(vehicle)) score += 100;
    if (intent.american && isAmericanVehicle(vehicle)) score += 100;
    if (intent.jdm && !isJdmVehicle(vehicle)) score -= 80;
    if (intent.german && !isGermanVehicle(vehicle)) score -= 80;
    if (intent.american && !isAmericanVehicle(vehicle)) score -= 80;
  }

  return score;
}

/**
 * Mock “LLM” matchmaker: parses coarse intent from natural language and scores
 * mock Ontology `Driver` + `Vehicle` pairs.
 *
 * TODO: Replace with Palantir AIP / LLM function on Ontology (e.g. tool-calling
 * into `Driver`/`Vehicle` search or a Foundry Function that returns ranked IDs).
 */
export async function mockLlmMatchRaceQuery(
  userPrompt: string,
): Promise<AipMatchResult | null> {
  await new Promise((r) => setTimeout(r, 520 + Math.random() * 380));

  const trimmed = userPrompt.trim();
  if (!trimmed) return null;

  const intent = parseIntent(trimmed);
  const hasConstraints =
    intent.maxHp !== undefined ||
    intent.minHp !== undefined ||
    intent.jdm ||
    intent.german ||
    intent.american;

  const ranked: { driver: Driver; vehicle: Vehicle; score: number }[] = [];

  for (const driver of MATCHMAKER_DRIVERS) {
    const vehicle = vehicleById(driver.vehicleId);
    if (!vehicle) continue;
    const score = scoreCandidate(driver, vehicle, intent);
    ranked.push({ driver, vehicle, score });
  }

  ranked.sort((a, b) => b.score - a.score);

  const best = ranked[0];
  if (!best) return null;

  if (hasConstraints && best.score < 0) return null;

  if (!hasConstraints) {
    const keywordHit =
      /\b(race|match|opponent|challenge|car|drive|hp|jdm|german|american|bmw|porsche|honda|toyota)\b/i.test(
        trimmed,
      );
    if (!keywordHit) return null;
  }

  return {
    driver: best.driver,
    vehicle: best.vehicle,
    mapPosition: positionForDriver(best.driver.id),
    score: best.score,
  };
}
