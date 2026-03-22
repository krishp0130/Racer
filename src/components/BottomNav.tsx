"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/radar",
    label: "Radar",
    sublabel: "Map",
    Icon: RadarIcon,
  },
  {
    href: "/garages",
    label: "Garages",
    sublabel: "Profile",
    Icon: GarageIcon,
  },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    sublabel: null,
    Icon: PodiumIcon,
  },
] as const;

function RadarIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      className="h-6 w-6"
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
      className="h-6 w-6"
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

function PodiumIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      className="h-6 w-6"
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

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[color-mix(in_oklab,var(--surface-elevated)_88%,transparent)] backdrop-blur-xl supports-[backdrop-filter]:bg-[color-mix(in_oklab,var(--surface-elevated)_72%,transparent)]"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-1 px-2 pt-2">
        {navItems.map(({ href, label, sublabel, Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] transition-colors ${
                active
                  ? "text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-[box-shadow,background-color] ${
                  active
                    ? "bg-[var(--accent-glow)] shadow-[0_0_24px_var(--accent-soft)]"
                    : "bg-transparent"
                }`}
              >
                <Icon active={active} />
              </span>
              <span className="truncate">{label}</span>
              {sublabel ? (
                <span className="-mt-0.5 truncate text-[0.55rem] font-medium normal-case tracking-normal text-[var(--muted)]">
                  {sublabel}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
