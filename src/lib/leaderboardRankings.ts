import type {
  GarageVehicle,
  MemberProfile,
  PerformanceRun,
  PerformanceRunType,
} from "@/types/communityOntology";

export function bestRunsByDriver(
  runs: PerformanceRun[],
  runType: PerformanceRunType,
): Map<string, PerformanceRun> {
  const filtered = runs.filter((r) => r.runType === runType);
  const byDriver = new Map<string, PerformanceRun[]>();
  for (const r of filtered) {
    const list = byDriver.get(r.driverId) ?? [];
    list.push(r);
    byDriver.set(r.driverId, list);
  }
  const out = new Map<string, PerformanceRun>();
  for (const [driverId, list] of byDriver) {
    out.set(driverId, pickBestRun(list, runType));
  }
  return out;
}

function pickBestRun(
  list: PerformanceRun[],
  runType: PerformanceRunType,
): PerformanceRun {
  if (runType === "zero_to_sixty" || runType === "zero_to_hundred") {
    return list.reduce((a, b) => {
      const ta = a.elapsedSeconds ?? Number.POSITIVE_INFINITY;
      const tb = b.elapsedSeconds ?? Number.POSITIVE_INFINITY;
      return ta <= tb ? a : b;
    });
  }
  return list.reduce((a, b) => {
    const sa = a.trapSpeedMph ?? -1;
    const sb = b.trapSpeedMph ?? -1;
    if (sa !== sb) return sb > sa ? b : a;
    const ea = a.elapsedSecondsDistance ?? Number.POSITIVE_INFINITY;
    const eb = b.elapsedSecondsDistance ?? Number.POSITIVE_INFINITY;
    return ea <= eb ? a : b;
  });
}

export function formatRunSummary(
  run: PerformanceRun,
  runType: PerformanceRunType,
): string {
  if (runType === "zero_to_sixty" || runType === "zero_to_hundred") {
    const s = run.elapsedSeconds;
    return s != null ? `${s.toFixed(2)}s` : "—";
  }
  const trap = run.trapSpeedMph;
  const et = run.elapsedSecondsDistance;
  if (trap != null && et != null) return `${trap} mph · ${et.toFixed(2)}s`;
  if (trap != null) return `${trap} mph`;
  if (et != null) return `${et.toFixed(2)}s`;
  return "—";
}

export function vehicleLabel(
  vehicleId: string | null,
  vehicles: GarageVehicle[],
): string {
  if (!vehicleId) return "—";
  const v = vehicles.find((x) => x.id === vehicleId);
  if (!v) return "—";
  return `${v.year} ${v.make} ${v.model}`;
}

export type DisciplineRow = {
  rank: number;
  member: MemberProfile;
  run: PerformanceRun;
  vehicleLabel: string;
};

export function disciplineLeaderboard(
  members: MemberProfile[],
  runs: PerformanceRun[],
  vehicles: GarageVehicle[],
  runType: PerformanceRunType,
): DisciplineRow[] {
  const best = bestRunsByDriver(runs, runType);
  const rows: DisciplineRow[] = [];
  for (const m of members) {
    const run = best.get(m.id);
    if (!run) continue;
    rows.push({
      rank: 0,
      member: m,
      run,
      vehicleLabel: vehicleLabel(run.vehicleId, vehicles),
    });
  }
  rows.sort((a, b) => compareRuns(a.run, b.run, runType));
  rows.forEach((r, i) => {
    r.rank = i + 1;
  });
  return rows;
}

function compareRuns(
  a: PerformanceRun,
  b: PerformanceRun,
  runType: PerformanceRunType,
): number {
  if (runType === "zero_to_sixty" || runType === "zero_to_hundred") {
    const ta = a.elapsedSeconds ?? Number.POSITIVE_INFINITY;
    const tb = b.elapsedSeconds ?? Number.POSITIVE_INFINITY;
    return ta - tb;
  }
  const sa = a.trapSpeedMph ?? -1;
  const sb = b.trapSpeedMph ?? -1;
  if (sa !== sb) return sb - sa;
  const ea = a.elapsedSecondsDistance ?? Number.POSITIVE_INFINITY;
  const eb = b.elapsedSecondsDistance ?? Number.POSITIVE_INFINITY;
  return ea - eb;
}
