"use client";

import { useCallback, useMemo, useState } from "react";
import { useCommunity } from "@/hooks/useCommunity";
import { communityOntologyService } from "@/services/communityOntologyService";
import type { PerformanceRunType } from "@/types/communityOntology";

const RUN_LABELS: Record<PerformanceRunType, string> = {
  zero_to_sixty: "0 → 60 mph",
  zero_to_hundred: "0 → 100 mph",
  half_mile: "½ mile (trap + ET)",
  quarter_mile: "¼ mile",
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function TrackPageClient() {
  const [state, refresh] = useCommunity();
  const me = state.currentMemberId;
  const myRuns = useMemo(
    () => state.performanceRuns.filter((r) => r.driverId === me),
    [state.performanceRuns, me],
  );
  const mySnaps = useMemo(
    () => state.telemetrySnapshots.filter((t) => t.driverId === me),
    [state.telemetrySnapshots, me],
  );
  const myCars = useMemo(
    () => state.garageVehicles.filter((v) => v.ownerMemberId === me),
    [state.garageVehicles, me],
  );

  const [runType, setRunType] = useState<PerformanceRunType>("zero_to_sixty");
  const [vehicleId, setVehicleId] = useState<string>(
    () => myCars.find((c) => c.isPrimary)?.id ?? myCars[0]?.id ?? "",
  );
  const [busy, setBusy] = useState(false);

  const simulateRun = useCallback(() => {
    setBusy(true);
    window.setTimeout(() => {
      let elapsedSeconds: number | null = null;
      let trapSpeedMph: number | null = null;
      let elapsedSecondsDistance: number | null = null;

      if (runType === "zero_to_sixty") {
        elapsedSeconds = Number(randomBetween(3.1, 4.8).toFixed(2));
      } else if (runType === "zero_to_hundred") {
        elapsedSeconds = Number(randomBetween(7.5, 11.2).toFixed(2));
      } else if (runType === "half_mile") {
        trapSpeedMph = Math.round(randomBetween(132, 162));
        elapsedSecondsDistance = Number(randomBetween(10.5, 13.8).toFixed(2));
      } else {
        trapSpeedMph = Math.round(randomBetween(108, 128));
        elapsedSecondsDistance = Number(randomBetween(11.0, 13.5).toFixed(2));
      }

      communityOntologyService.addPerformanceRun({
        driverId: me,
        vehicleId: vehicleId || null,
        runType,
        elapsedSeconds,
        trapSpeedMph,
        elapsedSecondsDistance,
        recordedAt: new Date().toISOString(),
        notes: "Simulated MVP run (replace with GPS / dragy ingest)",
      });
      refresh();
      setBusy(false);
    }, 900);
  }, [me, vehicleId, runType, refresh]);

  const logTelemetry = useCallback(() => {
    communityOntologyService.addTelemetrySnapshot({
      driverId: me,
      recordedAt: new Date().toISOString(),
      speedMph: Math.round(randomBetween(0, 85)),
      latitude: 37.7749 + randomBetween(-0.02, 0.02),
      longitude: -122.4194 + randomBetween(-0.02, 0.02),
      heading: Math.round(randomBetween(0, 359)),
    });
    refresh();
  }, [me, refresh]);

  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 py-6 md:px-8 md:py-8 lg:px-10">
      <header className="mb-8">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Ontology: PerformanceRun + TelemetrySnapshot
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          Track
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] md:text-base">
          Log 0–60, 0–100, strip passes, and driver telemetry snapshots —
          persisted locally as JSON for future Foundry pipelines.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            Log a run (simulated)
          </h2>
          <label className="mt-4 block text-sm text-[var(--muted)]">
            Run type
            <select
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              value={runType}
              onChange={(e) =>
                setRunType(e.target.value as PerformanceRunType)
              }
            >
              {(Object.keys(RUN_LABELS) as PerformanceRunType[]).map((k) => (
                <option key={k} value={k}>
                  {RUN_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 block text-sm text-[var(--muted)]">
            Vehicle
            <select
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
            >
              {myCars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.year} {c.make} {c.model}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={busy || !vehicleId}
            onClick={simulateRun}
            className="mt-6 w-full rounded-2xl bg-[var(--accent)] py-3 text-sm font-bold uppercase tracking-wider text-[#04100e] disabled:opacity-40"
          >
            {busy ? "Recording…" : "Simulate & save run"}
          </button>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            Driver telemetry trace
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Append a snapshot (speed + rough lat/lng) to mimic mobile streaming
            into Ontology.
          </p>
          <button
            type="button"
            onClick={logTelemetry}
            className="mt-6 w-full rounded-2xl border border-[var(--border)] py-3 text-sm font-semibold text-[var(--foreground)] hover:bg-white/5"
          >
            Log snapshot now
          </button>
        </section>
      </div>

      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          Your runs
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                <th className="pb-2 pr-4 font-medium">Type</th>
                <th className="pb-2 pr-4 font-medium">Time / data</th>
                <th className="pb-2 pr-4 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {myRuns.map((r) => (
                <tr key={r.id} className="border-b border-[var(--border)]/60">
                  <td className="py-3 pr-4">{RUN_LABELS[r.runType]}</td>
                  <td className="py-3 pr-4 font-mono text-xs">
                    {r.elapsedSeconds != null && `${r.elapsedSeconds}s`}
                    {r.trapSpeedMph != null && ` ${r.trapSpeedMph} mph trap`}
                    {r.elapsedSecondsDistance != null &&
                      ` · ${r.elapsedSecondsDistance}s`}
                  </td>
                  <td className="py-3 text-[var(--muted)]">
                    {new Date(r.recordedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          All drivers — recent telemetry
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                <th className="pb-2 pr-4 font-medium">Driver</th>
                <th className="pb-2 pr-4 font-medium">mph</th>
                <th className="pb-2 pr-4 font-medium">Position</th>
                <th className="pb-2 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {[...state.telemetrySnapshots]
                .sort(
                  (a, b) =>
                    new Date(b.recordedAt).getTime() -
                    new Date(a.recordedAt).getTime(),
                )
                .slice(0, 40)
                .map((t) => {
                  const name =
                    state.memberProfiles.find((m) => m.id === t.driverId)
                      ?.username ?? t.driverId;
                  return (
                    <tr
                      key={t.id}
                      className="border-b border-[var(--border)]/60"
                    >
                      <td className="py-2 pr-4">{name}</td>
                      <td className="py-2 pr-4 font-mono">{t.speedMph}</td>
                      <td className="py-2 pr-4 font-mono text-xs text-[var(--muted)]">
                        {t.latitude.toFixed(4)}, {t.longitude.toFixed(4)}
                      </td>
                      <td className="py-2 text-[var(--muted)]">
                        {new Date(t.recordedAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
