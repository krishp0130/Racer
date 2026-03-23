/**
 * Core racing / telemetry Ontology objects.
 * Community, garage, chat, and forum types live in `communityOntology.ts`
 * (same JSON blob in MVP localStorage, separate Foundry object types later).
 */

export interface Driver {
  id: string;
  username: string;
  vehicleId: string;
  eloRating: number;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  horsepower: number;
  class: string;
}

export interface LiveTelemetry {
  driverId: string;
  latitude: number;
  longitude: number;
  /** Speed in mph (MVP convention for privacy “driving” threshold). */
  speed: number;
  heading: number;
  timestamp: string;
}

export type RaceStatus = "pending" | "countdown" | "active" | "finished";

export interface RaceCoordinates {
  latitude: number;
  longitude: number;
}

export interface Race {
  id: string;
  status: RaceStatus;
  participants: string[];
  startCoords: RaceCoordinates;
  finishCoords: RaceCoordinates;
  winnerId: string | null;
}
