/**
 * Writes synthetic Ontology-shaped datasets for Palantir Foundry / AIP ingestion.
 * Run: npm run export:foundry
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { generateRaceHistory, type HistoricalRace } from "../src/utils/generateHistory";
import {
  SYNTHETIC_DRIVERS,
  SYNTHETIC_MATCHMAKING_SEED,
  SYNTHETIC_VEHICLES,
} from "../src/utils/seedData";
import type { Driver, Vehicle } from "../src/types/ontology";

const OUT_DIR = join(process.cwd(), "data", "foundry");

const EXPORT_VERSION = "1.0.0";

type RaceAnalyticsRow = HistoricalRace & {
  /** Seconds between start and end (for dashboards / AIP features). */
  durationSeconds: number;
  /** The participant that did not win (two-driver races). */
  loserDriverId: string | null;
  participantCount: 2;
};

function enrichRace(r: HistoricalRace): RaceAnalyticsRow {
  const start = new Date(r.startTime).getTime();
  const end = new Date(r.endTime).getTime();
  const durationSeconds = Math.max(0, (end - start) / 1000);
  const loserDriverId =
    r.winnerId == null
      ? null
      : (r.participants.find((id) => id !== r.winnerId) ?? null);
  return {
    ...r,
    durationSeconds,
    loserDriverId,
    participantCount: 2,
  };
}

const ONTOLOGY_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "Racer Foundry export — object shapes",
  description:
    "Aligns with src/types/ontology.ts Driver, Vehicle, Race (+ HistoricalRace timestamps).",
  definitions: {
    Driver: {
      type: "object",
      required: ["id", "username", "vehicleId", "eloRating"],
      properties: {
        id: { type: "string", description: "Primary key; links LiveTelemetry.driverId" },
        username: { type: "string" },
        vehicleId: { type: "string", description: "FK → Vehicle.id" },
        eloRating: { type: "number", minimum: 0 },
      },
      additionalProperties: false,
    },
    Vehicle: {
      type: "object",
      required: ["id", "make", "model", "year", "horsepower", "class"],
      properties: {
        id: { type: "string" },
        make: { type: "string" },
        model: { type: "string" },
        year: { type: "integer" },
        horsepower: { type: "number" },
        class: { type: "string", description: "e.g. JDM, Euro, Muscle" },
      },
      additionalProperties: false,
    },
    HistoricalRace: {
      type: "object",
      required: [
        "id",
        "status",
        "participants",
        "startCoords",
        "finishCoords",
        "winnerId",
        "startTime",
        "endTime",
      ],
      properties: {
        id: { type: "string" },
        status: { const: "finished" },
        participants: {
          type: "array",
          items: { type: "string" },
          minItems: 2,
          maxItems: 2,
        },
        startCoords: {
          type: "object",
          required: ["latitude", "longitude"],
          properties: {
            latitude: { type: "number" },
            longitude: { type: "number" },
          },
        },
        finishCoords: {
          type: "object",
          required: ["latitude", "longitude"],
          properties: {
            latitude: { type: "number" },
            longitude: { type: "number" },
          },
        },
        winnerId: { type: ["string", "null"] },
        startTime: { type: "string", format: "date-time" },
        endTime: { type: "string", format: "date-time" },
      },
    },
  },
};

function writeJson(name: string, data: unknown, pretty = true): void {
  const space = pretty ? 2 : 0;
  writeFileSync(join(OUT_DIR, name), `${JSON.stringify(data, null, space)}\n`, "utf8");
}

function main(): void {
  mkdirSync(OUT_DIR, { recursive: true });

  const drivers: Driver[] = SYNTHETIC_DRIVERS.map((d) => ({ ...d }));
  const vehicles: Vehicle[] = SYNTHETIC_VEHICLES.map((v) => ({ ...v }));

  const races = generateRaceHistory({ count: 500, seed: 42_001, maxDaysAgo: 180 });
  const racesAnalytics = races.map(enrichRace);

  const driverVehicleRows = SYNTHETIC_MATCHMAKING_SEED.map((row) => ({
    driverId: row.driver.id,
    vehicleId: row.vehicle.id,
    username: row.driver.username,
    vehicleLabel: `${row.vehicle.year} ${row.vehicle.make} ${row.vehicle.model}`,
    vehicleClass: row.vehicle.class,
    eloRating: row.driver.eloRating,
    horsepower: row.vehicle.horsepower,
  }));

  const generatedAt = new Date().toISOString();

  writeJson("drivers.json", drivers);
  writeJson("vehicles.json", vehicles);
  writeJson("driver_vehicle_assignments.json", driverVehicleRows);
  writeJson("races_completed.json", races);
  writeJson("races_completed_analytics.json", racesAnalytics);
  writeJson("ontology_schema.json", ONTOLOGY_SCHEMA);

  const ndjson = racesAnalytics.map((r) => JSON.stringify(r)).join("\n");
  writeFileSync(join(OUT_DIR, "races_completed_analytics.ndjson"), `${ndjson}\n`, "utf8");

  const bundle = {
    _export: {
      exportVersion: EXPORT_VERSION,
      generatedAt,
      source: "racer/scripts/export-foundry-data.ts",
      appOntology: "src/types/ontology.ts",
    },
    drivers,
    vehicles,
    driverVehicleAssignments: driverVehicleRows,
    racesCompleted: racesAnalytics,
  };
  writeJson("racer_foundry_bundle.json", bundle);

  const manifest = {
    exportVersion: EXPORT_VERSION,
    generatedAt,
    description:
      "Synthetic Racer data for Palantir Foundry datasets and AIP tools (matchmaking, analytics).",
    files: [
      {
        path: "drivers.json",
        objectType: "Driver",
        rowCount: drivers.length,
        primaryKey: "id",
      },
      {
        path: "vehicles.json",
        objectType: "Vehicle",
        rowCount: vehicles.length,
        primaryKey: "id",
      },
      {
        path: "driver_vehicle_assignments.json",
        objectType: "Join / denormalized row",
        rowCount: driverVehicleRows.length,
        note: "Convenience for pipelines; FK driverId → drivers, vehicleId → vehicles",
      },
      {
        path: "races_completed.json",
        objectType: "Race",
        rowCount: races.length,
        primaryKey: "id",
        note: "Strict HistoricalRace (Ontology Race + ISO startTime/endTime)",
      },
      {
        path: "races_completed_analytics.json",
        objectType: "Race",
        rowCount: racesAnalytics.length,
        primaryKey: "id",
        note: "Adds durationSeconds, loserDriverId for dashboards and AIP",
      },
      {
        path: "races_completed_analytics.ndjson",
        objectType: "Race",
        rowCount: racesAnalytics.length,
        format: "newline-delimited JSON",
        note: "One JSON object per line — common Foundry bulk ingest",
      },
      {
        path: "racer_foundry_bundle.json",
        objectType: "Bundle",
        note: "Single-file snapshot: drivers + vehicles + assignments + races (analytics shape)",
      },
      {
        path: "ontology_schema.json",
        objectType: "JSON Schema",
        note: "Documents Driver, Vehicle, HistoricalRace field shapes",
      },
    ],
  };
  writeJson("manifest.json", manifest);

  console.log(`Foundry export written to ${OUT_DIR}`);
  console.log(
    `  drivers: ${drivers.length}, vehicles: ${vehicles.length}, races: ${races.length}`,
  );
}

main();
