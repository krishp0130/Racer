#!/usr/bin/env node
/**
 * Exports synthetic Driver, Vehicle, and Race rows to CSV using only Node fs.
 * Headers match src/types/ontology.ts property names (camelCase).
 *
 * Races include HistoricalRace fields startTime / endTime (ISO-8601) alongside Race.
 *
 * Input:  data/foundry/drivers.json, vehicles.json, races_completed.json
 * Output: data/csv/drivers.csv, vehicles.csv, races.csv
 *
 * Run: node scripts/export-ontology-csv.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const IN_DIR = path.join(ROOT, "data", "foundry");
const OUT_DIR = path.join(ROOT, "data", "csv");

/** Ontology Driver — column order matches interface declaration. */
const DRIVER_HEADERS = ["id", "username", "vehicleId", "eloRating"];

/** Ontology Vehicle */
const VEHICLE_HEADERS = ["id", "make", "model", "year", "horsepower", "class"];

/**
 * Ontology Race + generated timestamps (HistoricalRace).
 * Nested participants / startCoords / finishCoords are JSON strings per column.
 */
const RACE_HEADERS = [
  "id",
  "status",
  "participants",
  "startCoords",
  "finishCoords",
  "winnerId",
  "startTime",
  "endTime",
];

/**
 * @param {string} raw
 */
function escapeCsvCell(raw) {
  if (raw.includes('"')) raw = raw.replace(/"/g, '""');
  if (/[",\r\n]/.test(raw)) return `"${raw}"`;
  return raw;
}

/**
 * @param {string[]} headers
 * @param {Record<string, unknown>[]} rows
 */
function rowsToCsv(headers, rows) {
  const lines = [headers.map(escapeCsvCell).join(",")];
  for (const row of rows) {
    const cells = headers.map((h) => {
      const v = row[h];
      if (v === null || v === undefined) return "";
      if (typeof v === "object") return escapeCsvCell(JSON.stringify(v));
      return escapeCsvCell(String(v));
    });
    lines.push(cells.join(","));
  }
  return lines.join("\r\n") + "\r\n";
}

function main() {
  const driversPath = path.join(IN_DIR, "drivers.json");
  const vehiclesPath = path.join(IN_DIR, "vehicles.json");
  const racesPath = path.join(IN_DIR, "races_completed.json");

  for (const p of [driversPath, vehiclesPath, racesPath]) {
    if (!fs.existsSync(p)) {
      console.error(`Missing input file: ${p}\nRun: npm run export:foundry`);
      process.exit(1);
    }
  }

  /** @type {Record<string, unknown>[]} */
  const drivers = JSON.parse(fs.readFileSync(driversPath, "utf8"));
  /** @type {Record<string, unknown>[]} */
  const vehicles = JSON.parse(fs.readFileSync(vehiclesPath, "utf8"));
  /** @type {Record<string, unknown>[]} */
  const races = JSON.parse(fs.readFileSync(racesPath, "utf8"));

  fs.mkdirSync(OUT_DIR, { recursive: true });

  fs.writeFileSync(
    path.join(OUT_DIR, "drivers.csv"),
    rowsToCsv(DRIVER_HEADERS, drivers),
    "utf8",
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "vehicles.csv"),
    rowsToCsv(VEHICLE_HEADERS, vehicles),
    "utf8",
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "races.csv"),
    rowsToCsv(RACE_HEADERS, races),
    "utf8",
  );

  console.log(`Wrote ${OUT_DIR}/drivers.csv (${drivers.length} rows)`);
  console.log(`Wrote ${OUT_DIR}/vehicles.csv (${vehicles.length} rows)`);
  console.log(`Wrote ${OUT_DIR}/races.csv (${races.length} rows)`);
}

main();
