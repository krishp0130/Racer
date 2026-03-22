"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/community/friends", label: "Friends", prefix: "/community/friends" },
  {
    href: "/community/messages",
    label: "Messages",
    prefix: "/community/messages",
  },
  { href: "/community/forums", label: "Forums", prefix: "/community/forums" },
] as const;

export function CommunityLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 py-6 md:px-8 md:py-8 lg:px-10">
      <header className="mb-6">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Community
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          Connect
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          Friends, DMs, group chats, and forums — backed by the same local
          Ontology document as Garage &amp; Track.
        </p>
      </header>
      <div className="mb-8 flex flex-wrap gap-2 border-b border-[var(--border)] pb-4">
        {tabs.map((t) => {
          const active = pathname.startsWith(t.prefix);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-[var(--accent-glow)] text-[var(--accent)]"
                  : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
