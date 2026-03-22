"use client";

import Link from "next/link";
import { useCommunity } from "@/hooks/useCommunity";
import { communityOntologyService } from "@/services/communityOntologyService";

const catLabel: Record<string, string> = {
  cars: "Cars",
  bikes: "Bikes",
  general: "General",
  meets: "Meets",
  tech: "Tech",
  motorsport: "Motorsport",
};

export function ForumsListClient() {
  const [state, refresh] = useCommunity();
  const me = state.currentMemberId;

  const joined = (forumId: string) =>
    state.forumMemberships.some(
      (m) => m.forumId === forumId && m.memberId === me,
    );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {state.forums.map((f) => (
        <article
          key={f.id}
          className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
        >
          <span className="text-[0.6rem] font-bold uppercase tracking-wider text-[var(--accent)]">
            {catLabel[f.category] ?? f.category}
          </span>
          <h2 className="mt-2 text-lg font-semibold">{f.title}</h2>
          <p className="mt-2 flex-1 text-sm text-[var(--muted)]">
            {f.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/community/forums/${f.id}`}
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#04100e]"
            >
              Open
            </Link>
            {!joined(f.id) ? (
              <button
                type="button"
                onClick={() => {
                  communityOntologyService.joinForum(f.id, me);
                  refresh();
                }}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-semibold"
              >
                Join
              </button>
            ) : (
              <span className="self-center text-xs text-[var(--muted)]">
                Joined
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
