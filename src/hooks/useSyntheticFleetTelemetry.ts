"use client";

import { useEffect, useState } from "react";
import type { LngLat } from "@/lib/geo";
import { foundryClient } from "@/services/foundryClient";
import { TelemetryEngine } from "@/services/telemetryEngine";
import type { LiveTelemetry } from "@/types/ontology";
import { SYNTHETIC_DRIVERS } from "@/utils/seedData";

const DEFAULT_FLEET_SIZE = 10;

export type SyntheticFleetState = {
  telemetryByDriverId: Record<string, LiveTelemetry>;
  usernamesByDriverId: Record<string, string>;
};

/**
 * Runs `TelemetryEngine` around `center`, merges drivers into `foundryClient`, and
 * mirrors each tick into Foundry telemetry so Radar / analytics stay aligned.
 */
export function useSyntheticFleetTelemetry(
  center: LngLat,
  fleetSize: number = DEFAULT_FLEET_SIZE,
): SyntheticFleetState {
  const [state, setState] = useState<SyntheticFleetState>({
    telemetryByDriverId: {},
    usernamesByDriverId: {},
  });

  useEffect(() => {
    const drivers = SYNTHETIC_DRIVERS.slice(
      0,
      Math.min(fleetSize, SYNTHETIC_DRIVERS.length),
    );
    if (drivers.length === 0) return;

    foundryClient.mergeDrivers(drivers);

    const usernamesByDriverId = Object.fromEntries(
      drivers.map((d) => [d.id, d.username] as const),
    );

    const engine = new TelemetryEngine({
      drivers,
      center: { latitude: center.latitude, longitude: center.longitude },
      intervalMs: 1000,
    });

    const off = engine.subscribe(({ telemetryByDriverId }) => {
      setState({ telemetryByDriverId, usernamesByDriverId });
      foundryClient.mergeTelemetryBatch(Object.values(telemetryByDriverId));
    });

    engine.startSimulation();

    return () => {
      off();
      engine.stopSimulation();
    };
  }, [center.latitude, center.longitude, fleetSize]);

  return state;
}
