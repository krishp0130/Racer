"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import type { LngLat } from "@/lib/geo";
import { haversineMeters, interpolateToward, metersToMiles } from "@/lib/geo";
import type { Vehicle } from "@/types/ontology";
import "maplibre-gl/dist/maplibre-gl.css";

const MAP_STYLE = "https://demotiles.maplibre.org/style.json";

const INITIAL_CENTER: LngLat = {
  longitude: -122.4194,
  latitude: 37.7749,
};

const OPPONENT: { username: string; vehicle: Vehicle; position: LngLat } = {
  username: "NeonShift",
  vehicle: {
    id: "veh-opp-1",
    make: "Porsche",
    model: "911 GT3",
    year: 2022,
    horsepower: 502,
    class: "GT",
  },
  position: {
    longitude: INITIAL_CENTER.longitude + 0.008,
    latitude: INITIAL_CENTER.latitude + 0.004,
  },
};

type Phase =
  | "browsing"
  | "opponentSheet"
  | "placingFinish"
  | "awaitingAccept"
  | "countdown"
  | "active";

function formatMiles(meters: number): string {
  const mi = metersToMiles(meters);
  if (mi >= 10) return `${mi.toFixed(1)} mi`;
  if (mi >= 1) return `${mi.toFixed(2)} mi`;
  return `${(mi * 5280).toFixed(0)} ft`;
}

export default function RadarRaceExperience() {
  const [phase, setPhase] = useState<Phase>("browsing");
  const [finish, setFinish] = useState<LngLat | null>(null);
  const [userPos, setUserPos] = useState<LngLat>(INITIAL_CENTER);
  const [speedMph, setSpeedMph] = useState(0);
  const [countdownLabel, setCountdownLabel] = useState<string | null>(null);
  const [acceptNotice, setAcceptNotice] = useState(false);
  const acceptTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const raceTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const raceSpeedRef = useRef(0);

  const distanceRemaining = useMemo(() => {
    if (!finish || phase !== "active") return null;
    return haversineMeters(userPos, finish);
  }, [finish, phase, userPos]);

  const clearAcceptTimers = useCallback(() => {
    acceptTimersRef.current.forEach(clearTimeout);
    acceptTimersRef.current = [];
  }, []);

  const clearRaceTick = useCallback(() => {
    if (raceTickRef.current) {
      clearInterval(raceTickRef.current);
      raceTickRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearAcceptTimers();
      clearRaceTick();
    };
  }, [clearAcceptTimers, clearRaceTick]);

  useEffect(() => {
    if (phase !== "awaitingAccept" || !finish) return;
    clearAcceptTimers();
    const t1 = setTimeout(() => {
      setAcceptNotice(true);
      const t2 = setTimeout(() => {
        setAcceptNotice(false);
        setPhase("countdown");
      }, 1000);
      acceptTimersRef.current.push(t2);
    }, 2000);
    acceptTimersRef.current.push(t1);
    return () => clearAcceptTimers();
  }, [phase, finish, clearAcceptTimers]);

  useEffect(() => {
    if (phase !== "countdown") {
      setCountdownLabel(null);
      return;
    }

    let cancelled = false;
    const seq = ["3", "2", "1", "GO"] as const;

    const run = async () => {
      for (const label of seq) {
        if (cancelled) return;
        setCountdownLabel(label);
        await new Promise((r) => setTimeout(r, label === "GO" ? 700 : 820));
      }
      if (!cancelled) {
        setCountdownLabel(null);
        setUserPos(INITIAL_CENTER);
        raceSpeedRef.current = 52 + Math.random() * 18;
        setSpeedMph(Math.round(raceSpeedRef.current));
        setPhase("active");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "active" || !finish) {
      clearRaceTick();
      if (phase !== "active") setSpeedMph(0);
      return;
    }

    raceTickRef.current = setInterval(() => {
      let speed = raceSpeedRef.current;
      speed = Math.min(118, Math.max(38, speed + (Math.random() - 0.5) * 8));
      raceSpeedRef.current = speed;
      setSpeedMph(Math.round(speed));

      const mps = speed * 0.44704;
      const meters = mps * 0.2;

      setUserPos((prev) => {
        const next = interpolateToward(prev, finish, meters);
        if (haversineMeters(next, finish) < 10) return { ...finish };
        return next;
      });
    }, 200);

    return () => clearRaceTick();
  }, [phase, finish, clearRaceTick]);

  useEffect(() => {
    if (phase !== "active" || !finish) return;
    if (distanceRemaining !== null && distanceRemaining < 12) {
      clearRaceTick();
      setSpeedMph(0);
    }
  }, [phase, finish, distanceRemaining, clearRaceTick]);

  const openOpponent = useCallback(() => {
    if (phase !== "browsing") return;
    setPhase("opponentSheet");
  }, [phase]);

  const closeSheet = useCallback(() => {
    if (phase === "opponentSheet") setPhase("browsing");
  }, [phase]);

  const onChallenge = useCallback(() => {
    setPhase("placingFinish");
  }, []);

  const onMapClick = useCallback(
    (e: { lngLat: { lng: number; lat: number } }) => {
      if (phase !== "placingFinish") return;
      setFinish({ longitude: e.lngLat.lng, latitude: e.lngLat.lat });
      setPhase("awaitingAccept");
    },
    [phase],
  );

  const mapCursor =
    phase === "placingFinish" ? "crosshair" : "grab";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-2 pt-5 sm:px-6">
      <header className="pointer-events-none relative z-10 shrink-0 select-none">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Live grid
        </p>
        <h1 className="mt-1 font-semibold text-2xl tracking-tight text-[var(--foreground)]">
          Radar
        </h1>
      </header>

      <div
        className={`relative z-0 flex min-h-[min(520px,62vh)] flex-1 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_0_0_1px_color-mix(in_oklab,var(--accent)_12%,transparent)] ${
          phase === "placingFinish" ? "ring-2 ring-[var(--accent-soft)]" : ""
        }`}
      >
        <Map
          mapLib={maplibregl}
          initialViewState={{
            ...INITIAL_CENTER,
            zoom: 12.4,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={MAP_STYLE}
          onClick={onMapClick}
          cursor={mapCursor}
          attributionControl={false}
        >
          <Marker
            longitude={OPPONENT.position.longitude}
            latitude={OPPONENT.position.latitude}
            anchor="center"
          >
            <button
              type="button"
              disabled={phase !== "browsing"}
              onClick={(e) => {
                e.stopPropagation();
                openOpponent();
              }}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--accent)] bg-[color-mix(in_oklab,var(--surface-elevated)_82%,transparent)] shadow-[0_0_28px_var(--accent-soft)] backdrop-blur-md transition-[transform,opacity] active:scale-95 enabled:hover:brightness-110 disabled:pointer-events-none disabled:opacity-35"
              aria-label={`Open ${OPPONENT.username} profile`}
            >
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--accent)] opacity-20" />
              <span className="relative text-xs font-bold text-[var(--accent)]">
                VS
              </span>
            </button>
          </Marker>

          {finish ? (
            <Marker
              longitude={finish.longitude}
              latitude={finish.latitude}
              anchor="bottom"
            >
              <div
                className="flex flex-col items-center gap-1"
                aria-label="Finish line"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="rounded-md border border-white/20 bg-[var(--surface-elevated)] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-[var(--foreground)] shadow-lg backdrop-blur-md">
                  Finish
                </span>
                <div className="h-9 w-9 rounded-lg border-2 border-white/30 bg-[repeating-conic-gradient(#111_0%_25%,#eee_0%_50%)_50%_/_8px_8px] shadow-[0_0_24px_rgba(255,255,255,0.35)]" />
              </div>
            </Marker>
          ) : null}

          {phase === "active" ? (
            <Marker
              longitude={userPos.longitude}
              latitude={userPos.latitude}
              anchor="center"
            >
              <div className="h-4 w-4 rounded-full border-2 border-white bg-[var(--accent)] shadow-[0_0_16px_var(--accent)]" />
            </Marker>
          ) : null}
        </Map>

        {phase === "placingFinish" ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-3">
            <div className="max-w-md rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface-elevated)_88%,transparent)] px-4 py-3 text-center shadow-xl backdrop-blur-xl">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Tap the map to drop the finish line
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                We’ll sync the sprint start once your rival accepts.
              </p>
            </div>
          </div>
        ) : null}

        {acceptNotice ? (
          <div className="pointer-events-none absolute inset-x-0 top-16 z-30 flex justify-center px-3">
            <div className="animate-[race-toast_0.5s_ease-out_both] rounded-full border border-[var(--accent-soft)] bg-[color-mix(in_oklab,var(--surface-elevated)_90%,transparent)] px-5 py-2 text-sm font-medium text-[var(--accent)] shadow-[0_0_32px_var(--accent-soft)] backdrop-blur-md">
              {OPPONENT.username} accepted — staging line
            </div>
          </div>
        ) : null}

        {phase === "active" && distanceRemaining !== null ? (
          <div className="pointer-events-none absolute left-3 right-3 top-3 z-30 flex gap-2 sm:left-4 sm:right-4 sm:top-4">
            <div className="flex flex-1 items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface-elevated)_86%,transparent)] px-4 py-3 shadow-lg backdrop-blur-xl">
              <div>
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Speed
                </p>
                <p className="font-mono text-xl font-semibold tabular-nums text-[var(--foreground)]">
                  {Math.round(speedMph)}{" "}
                  <span className="text-sm font-medium text-[var(--muted)]">
                    mph
                  </span>
                </p>
              </div>
              <div className="h-10 w-px bg-[var(--border)]" />
              <div className="text-right">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  To finish
                </p>
                <p className="font-mono text-xl font-semibold tabular-nums text-[var(--accent)]">
                  {formatMiles(distanceRemaining)}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {phase === "opponentSheet" ? (
          <>
            <button
              type="button"
              className="absolute inset-0 z-40 bg-black/55 backdrop-blur-[2px] animate-[race-backdrop_0.35s_ease-out_both]"
              aria-label="Close"
              onClick={closeSheet}
            />
            <div
              className="absolute inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-3xl border border-[var(--border)] border-b-0 bg-[color-mix(in_oklab,var(--surface-elevated)_94%,transparent)] shadow-[0_-12px_48px_rgba(0,0,0,0.45)] backdrop-blur-2xl animate-[race-sheet_0.4s_cubic-bezier(0.22,1,0.36,1)_both] sm:inset-x-auto sm:bottom-6 sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:rounded-3xl sm:border-b"
              role="dialog"
              aria-modal="true"
              aria-labelledby="opponent-sheet-title"
            >
              <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/15 sm:hidden" />
              <div className="p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Opponent
                    </p>
                    <h2
                      id="opponent-sheet-title"
                      className="mt-1 text-xl font-semibold tracking-tight"
                    >
                      {OPPONENT.username}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeSheet}
                    className="rounded-full border border-[var(--border)] p-2 text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
                    aria-label="Close sheet"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>

                <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    Vehicle
                  </p>
                  <p className="mt-2 text-lg font-semibold leading-snug">
                    {OPPONENT.vehicle.year} {OPPONENT.vehicle.make}{" "}
                    {OPPONENT.vehicle.model}
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-[var(--surface-elevated)] px-2 py-3">
                      <p className="text-[0.55rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                        Make
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {OPPONENT.vehicle.make}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[var(--surface-elevated)] px-2 py-3">
                      <p className="text-[0.55rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                        Model
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {OPPONENT.vehicle.model}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[var(--surface-elevated)] px-2 py-3">
                      <p className="text-[0.55rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                        HP
                      </p>
                      <p className="mt-1 text-sm font-semibold tabular-nums text-[var(--accent)]">
                        {OPPONENT.vehicle.horsepower}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onChallenge}
                  className="mt-6 w-full rounded-2xl bg-[var(--accent)] py-4 text-center text-sm font-bold uppercase tracking-[0.14em] text-[#04100e] shadow-[0_0_40px_var(--accent-soft)] transition-[transform,box-shadow] active:scale-[0.99] hover:shadow-[0_0_56px_var(--accent-soft)]"
                >
                  Challenge to sprint
                </button>
              </div>
            </div>
          </>
        ) : null}

        {countdownLabel ? (
          <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-[color-mix(in_oklab,#000_78%,transparent)] backdrop-blur-md"
            aria-live="assertive"
          >
            <div
              key={countdownLabel}
              className={`flex flex-col items-center ${
                countdownLabel === "GO"
                  ? "animate-[race-go_0.75s_cubic-bezier(0.22,1,0.36,1)_both]"
                  : "animate-[race-count_0.78s_cubic-bezier(0.22,1,0.36,1)_both]"
              }`}
            >
              <span
                className={`font-semibold tracking-tight text-[var(--foreground)] drop-shadow-[0_0_48px_var(--accent-soft)] ${
                  countdownLabel === "GO"
                    ? "text-[clamp(4rem,22vw,9rem)] text-[var(--accent)]"
                    : "text-[clamp(5rem,26vw,11rem)]"
                }`}
              >
                {countdownLabel}
              </span>
              {countdownLabel === "GO" ? (
                <span className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                  Punch it
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <footer className="relative z-10 shrink-0 rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface-elevated)_85%,transparent)] px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 text-[0.7rem] font-mono uppercase tracking-wider text-[var(--muted)]">
          <span className="tabular-nums">
            {INITIAL_CENTER.latitude.toFixed(3)}°N
          </span>
          <span className="text-[var(--accent)]">
            {phase === "browsing" && "Scan live"}
            {phase === "opponentSheet" && "Profile open"}
            {phase === "placingFinish" && "Place finish"}
            {phase === "awaitingAccept" && "Awaiting rival"}
            {phase === "countdown" && "Grid lock"}
            {phase === "active" && "Sprint live"}
          </span>
          <span className="tabular-nums">
            {Math.abs(INITIAL_CENTER.longitude).toFixed(3)}°W
          </span>
        </div>
      </footer>
    </div>
  );
}
