import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
};

const tiles = [
  {
    href: "/radar",
    title: "Radar",
    subtitle: "Map & sprint",
    desc: "Live map, synthetic fleet, and the AIP matchmaker overlay.",
    icon: "◎",
  },
  {
    href: "/matchmaker",
    title: "AIP",
    subtitle: "Matchmaker",
    desc: "Foundry agent session — sign in with PKCE, then chat.",
    icon: "◇",
  },
  {
    href: "/garages",
    title: "Garage",
    subtitle: "Builds",
    desc: "Vehicles, mods, and hero shots.",
    icon: "▣",
  },
  {
    href: "/track",
    title: "Track",
    subtitle: "0–60 & strip",
    desc: "Log performance runs and telemetry snapshots.",
    icon: "⏱",
  },
  {
    href: "/community/friends",
    title: "Crew",
    subtitle: "Social",
    desc: "Friends, forums, and messages.",
    icon: "☺",
  },
  {
    href: "/leaderboard",
    title: "Board",
    subtitle: "Standings",
    desc: "ELO demo and best logged times.",
    icon: "⌁",
  },
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-4 py-8 md:px-8 md:py-12 lg:px-10">
      <header className="mb-10 md:mb-12">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
          Racer
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Drive the grid
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)] md:text-base">
          Map-first racing demo: radar, garage, track logs, crew, leaderboard, and
          a Foundry AIP matchmaker when OAuth is configured.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--accent)_35%,var(--border))] hover:shadow-[0_0_40px_-8px_var(--accent-soft)]"
          >
            <span
              className="pointer-events-none absolute -right-6 -top-6 text-6xl font-light text-[color-mix(in_oklab,var(--foreground)_6%,transparent)] transition-opacity group-hover:opacity-80"
              aria-hidden
            >
              {t.icon}
            </span>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              {t.subtitle}
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--foreground)]">
              {t.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {t.desc}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
              Open
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
