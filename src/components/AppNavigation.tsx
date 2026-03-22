"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/radar", label: "Radar", sublabel: "Map", Icon: RadarIcon },
  { href: "/garages", label: "Garage", sublabel: "You", Icon: GarageIcon },
  { href: "/track", label: "Track", sublabel: "0–60", Icon: TrackIcon },
  {
    href: "/community/friends",
    label: "Crew",
    sublabel: "Social",
    Icon: CommunityIcon,
    matchPrefix: "/community",
  },
  { href: "/leaderboard", label: "Board", sublabel: null, Icon: PodiumIcon },
] as const;

type Item = (typeof navItems)[number];

function RadarIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      className="h-6 w-6 shrink-0 md:h-5 md:w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.25 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      <circle cx="12" cy="12" r="9" opacity={0.35} />
    </svg>
  );
}

function GarageIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      className="h-6 w-6 shrink-0 md:h-5 md:w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.25 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" />
      <path d="M14 9h1" opacity={active ? 1 : 0.5} />
    </svg>
  );
}

function TrackIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      className="h-6 w-6 shrink-0 md:h-5 md:w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.25 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v3l2.5 2.5" opacity={active ? 1 : 0.7} />
      <path d="M12 3v2M12 19v2" />
    </svg>
  );
}

function CommunityIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      className="h-6 w-6 shrink-0 md:h-5 md:w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.25 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PodiumIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      className="h-6 w-6 shrink-0 md:h-5 md:w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.25 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 21h8M12 17v4M6 10h4v7H6zM10 14h4v3h-4zM14 8h4v9h-4z" />
      <path d="M12 3v2" opacity={active ? 1 : 0.45} />
    </svg>
  );
}

function NavLink({
  href,
  label,
  sublabel,
  Icon,
  layout,
  matchPrefix,
}: {
  href: string;
  label: string;
  sublabel: string | null;
  Icon: typeof RadarIcon;
  layout: "sidebar" | "bottom";
  matchPrefix?: string;
}) {
  const pathname = usePathname();
  const active = matchPrefix
    ? pathname.startsWith(matchPrefix)
    : pathname === href || pathname.startsWith(`${href}/`);

  if (layout === "sidebar") {
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
          active
            ? "bg-[var(--accent-glow)] text-[var(--accent)] shadow-[0_0_20px_var(--accent-soft)]"
            : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
        }`}
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            active ? "bg-[var(--accent-glow)]" : "bg-[var(--surface)]"
          }`}
        >
          <Icon active={active} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold tracking-tight">
            {label}
          </span>
          {sublabel ? (
            <span className="block text-xs font-medium text-[var(--muted)]">
              {sublabel}
            </span>
          ) : null}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`flex min-w-[4.5rem] shrink-0 flex-col items-center gap-0.5 rounded-xl px-1.5 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.08em] transition-colors sm:min-w-[5rem] sm:text-[0.65rem] ${
        active
          ? "text-[var(--accent)]"
          : "text-[var(--muted)] hover:text-[var(--foreground)]"
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-[box-shadow,background-color] sm:h-10 sm:w-10 ${
          active
            ? "bg-[var(--accent-glow)] shadow-[0_0_24px_var(--accent-soft)]"
            : "bg-transparent"
        }`}
      >
        <Icon active={active} />
      </span>
      <span className="max-w-[4.5rem] truncate text-center leading-tight">
        {label}
      </span>
      {sublabel ? (
        <span className="max-w-[4.5rem] truncate text-[0.5rem] font-medium normal-case tracking-normal text-[var(--muted)] sm:text-[0.55rem]">
          {sublabel}
        </span>
      ) : null}
    </Link>
  );
}

export function AppNavigation() {
  return (
    <>
      <aside
        className="fixed left-0 top-0 z-50 hidden h-dvh w-64 flex-col overflow-y-auto border-r border-[var(--border)] bg-[color-mix(in_oklab,var(--surface-elevated)_92%,transparent)] px-4 pb-8 pt-8 backdrop-blur-xl md:flex"
        aria-label="Primary"
      >
        <Link
          href="/radar"
          className="mb-10 px-3 text-lg font-bold tracking-tight text-[var(--foreground)]"
        >
          Racer
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item: Item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              sublabel={item.sublabel}
              Icon={item.Icon}
              layout="sidebar"
              matchPrefix={"matchPrefix" in item ? item.matchPrefix : undefined}
            />
          ))}
        </nav>
      </aside>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[color-mix(in_oklab,var(--surface-elevated)_88%,transparent)] backdrop-blur-xl supports-[backdrop-filter]:bg-[color-mix(in_oklab,var(--surface-elevated)_72%,transparent)] md:hidden"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
        aria-label="Primary"
      >
        <div className="flex justify-start gap-0.5 overflow-x-auto px-2 pt-2 [scrollbar-width:none] sm:justify-center [&::-webkit-scrollbar]:hidden">
          {navItems.map((item: Item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              sublabel={item.sublabel}
              Icon={item.Icon}
              layout="bottom"
              matchPrefix={"matchPrefix" in item ? item.matchPrefix : undefined}
            />
          ))}
        </div>
      </nav>
    </>
  );
}
