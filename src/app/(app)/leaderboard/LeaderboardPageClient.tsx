"use client";

import { useMemo, useState } from "react";
import { useCommunity } from "@/hooks/useCommunity";
import { syntheticEloForMember } from "@/data/leaderboardSynthetic";
import {
  disciplineLeaderboard,
  formatRunSummary,
} from "@/lib/leaderboardRankings";
import type { PerformanceRunType } from "@/types/communityOntology";

const RUN_LABELS: Record<PerformanceRunType, string> = {
  zero_to_sixty: "0 → 60",
  zero_to_hundred: "0 → 100",
  half_mile: "½ mile",
  quarter_mile: "¼ mile",
};

function initials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  }
  return displayName.slice(0, 2).toUpperCase() || "?";
}

type EloRow = {
  rank: number;
  memberId: string;
  displayName: string;
  username: string;
  elo: number;
  weeklyDelta: number;
};

export function LeaderboardPageClient() {
  const [state] = useCommunity();
  const me = state.currentMemberId;
  const { memberProfiles, performanceRuns, garageVehicles } = state;

  const [discipline, setDiscipline] =
    useState<PerformanceRunType>("zero_to_sixty");

  const eloRows = useMemo((): EloRow[] => {
    const rows = memberProfiles.map((m) => {
      const { elo, weeklyDelta } = syntheticEloForMember(m.id);
      return {
        rank: 0,
        memberId: m.id,
        displayName: m.displayName,
        username: m.username,
        elo,
        weeklyDelta,
      };
    });
    rows.sort((a, b) => b.elo - a.elo);
    rows.forEach((r, i) => {
      r.rank = i + 1;
    });
    return rows;
  }, [memberProfiles]);

  const podium = eloRows.slice(0, 3);
  const podiumOrder =
    podium.length >= 3
      ? [podium[1]!, podium[0]!, podium[2]!]
      : podium.length === 2
        ? [podium[1]!, podium[0]!]
        : podium;

  const disciplineRows = useMemo(
    () =>
      disciplineLeaderboard(
        memberProfiles,
        performanceRuns,
        garageVehicles,
        discipline,
      ),
    [memberProfiles, performanceRuns, garageVehicles, discipline],
  );

  const runTypes = Object.keys(RUN_LABELS) as PerformanceRunType[];

  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 py-6 md:px-8 md:py-8 lg:px-10">
      <header className="mb-8">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Board · synthetic ELO + logged runs
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          Leaderboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] md:text-base">
          Global rating (demo) and all-time bests from Track performance runs
          stored in your local ontology state — add runs on Track to reshuffle
          the boards.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
        <section className="flex flex-col gap-6">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
              Podium · ELO
            </h2>
            <div className="mt-4 flex items-end justify-center gap-2 sm:gap-4">
              {podiumOrder.map((row) => {
                const h =
                  row.rank === 1
                    ? "min-h-[9.5rem]"
                    : row.rank === 2
                      ? "min-h-[7.5rem]"
                      : "min-h-[6rem]";
                const borderGlow =
                  row.rank === 1
                    ? "border-[color-mix(in_oklab,var(--accent)_55%,transparent)] shadow-[0_0_32px_var(--accent-soft)]"
                    : row.rank === 2
                      ? "border-white/20"
                      : "border-amber-900/40";
                return (
                  <div
                    key={row.memberId}
                    className={`flex w-[30%] max-w-[11rem] flex-col items-center rounded-2xl border bg-[var(--surface)] px-2 pb-4 pt-5 sm:px-3 ${h} ${borderGlow}`}
                  >
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold sm:h-14 sm:w-14 ${
                        row.rank === 1
                          ? "bg-[var(--accent-glow)] text-[var(--accent)]"
                          : "bg-[var(--surface-elevated)] text-[var(--foreground)]"
                      }`}
                    >
                      {initials(row.displayName)}
                    </span>
                    <p className="mt-3 w-full truncate text-center text-xs font-semibold sm:text-sm">
                      {row.displayName}
                    </p>
                    <p className="text-[0.65rem] text-[var(--muted)]">
                      @{row.username}
                    </p>
                    <p className="mt-2 font-mono text-lg font-bold text-[var(--accent)] sm:text-xl">
                      {row.elo}
                    </p>
                    <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      #{row.rank}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
              Full standings
            </h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    <th className="pb-2 pr-3">#</th>
                    <th className="pb-2 pr-3">Driver</th>
                    <th className="pb-2 pr-3 text-right">ELO</th>
                    <th className="pb-2 text-right">7d</th>
                  </tr>
                </thead>
                <tbody>
                  {eloRows.map((row) => (
                    <tr
                      key={row.memberId}
                      className={`border-b border-[color-mix(in_oklab,var(--border)_65%,transparent)] last:border-0 ${
                        row.memberId === me ? "bg-[var(--accent-glow)]/40" : ""
                      }`}
                    >
                      <td className="py-2.5 pr-3 font-mono text-[var(--muted)]">
                        {row.rank}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="font-medium">{row.displayName}</span>
                        {row.memberId === me ? (
                          <span className="ml-2 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--accent)]">
                            You
                          </span>
                        ) : null}
                        <span className="mt-0.5 block text-xs text-[var(--muted)]">
                          @{row.username}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-right font-mono font-semibold text-[var(--foreground)]">
                        {row.elo}
                      </td>
                      <td
                        className={`py-2.5 text-right font-mono text-xs font-medium ${
                          row.weeklyDelta > 0
                            ? "text-emerald-400"
                            : row.weeklyDelta < 0
                              ? "text-rose-400"
                              : "text-[var(--muted)]"
                        }`}
                      >
                        {row.weeklyDelta > 0
                          ? `+${row.weeklyDelta}`
                          : row.weeklyDelta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-[var(--muted)]">
              ELO is placeholder data for the MVP; wire to match outcomes when
              multiplayer lands.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            Best logged times
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Personal best per driver from PerformanceRun records (lower time or
            higher trap wins).
          </p>

          <div
            className="mt-4 flex flex-wrap gap-2"
            role="tablist"
            aria-label="Discipline"
          >
            {runTypes.map((rt) => (
              <button
                key={rt}
                type="button"
                role="tab"
                aria-selected={discipline === rt}
                onClick={() => setDiscipline(rt)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors sm:text-[0.65rem] ${
                  discipline === rt
                    ? "bg-[var(--accent)] text-[#04100e]"
                    : "bg-[var(--surface-elevated)] text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {RUN_LABELS[rt]}
              </button>
            ))}
          </div>

          {disciplineRows.length === 0 ? (
            <p className="mt-8 text-sm text-[var(--muted)]">
              No runs logged for {RUN_LABELS[discipline]}. Use Track to add one.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-[color-mix(in_oklab,var(--border)_70%,transparent)]">
              {disciplineRows.map((r) => (
                <li
                  key={r.member.id}
                  className={`flex flex-col gap-1 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between ${
                    r.member.id === me ? "rounded-xl bg-[var(--accent-glow)]/30 px-2 -mx-2 sm:px-3" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-elevated)] font-mono text-sm font-bold text-[var(--accent)]">
                      {r.rank}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-semibold">
                          {r.member.displayName}
                        </span>
                        {r.member.id === me ? (
                          <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--accent)]">
                            You
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-[var(--muted)]">
                        @{r.member.username} · {r.vehicleLabel}
                      </p>
                    </div>
                  </div>
                  <div className="pl-12 text-left sm:pl-0 sm:text-right">
                    <p className="font-mono text-lg font-semibold text-[var(--foreground)]">
                      {formatRunSummary(r.run, discipline)}
                    </p>
                    <p className="text-[0.65rem] text-[var(--muted)]">
                      {new Date(r.run.recordedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
