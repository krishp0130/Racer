"use client";

import dynamic from "next/dynamic";

const RadarRaceExperience = dynamic(() => import("./RadarRaceExperience"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[min(520px,62vh)] flex-1 items-center justify-center px-6 text-sm text-[var(--muted)]">
      Loading radar…
    </div>
  ),
});

export function RadarClientEntry() {
  return <RadarRaceExperience />;
}
