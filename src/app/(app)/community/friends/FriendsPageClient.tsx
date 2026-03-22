"use client";

import { useMemo, useState } from "react";
import { useCommunity } from "@/hooks/useCommunity";
import { communityOntologyService } from "@/services/communityOntologyService";
import { areFriends, hasPendingBetween } from "@/lib/friendUtils";

export function FriendsPageClient() {
  const [state, refresh] = useCommunity();
  const me = state.currentMemberId;
  const [pick, setPick] = useState("");

  const incoming = useMemo(
    () =>
      state.friendRequests.filter(
        (r) => r.toMemberId === me && r.status === "pending",
      ),
    [state.friendRequests, me],
  );

  const friends = useMemo(() => {
    const set = new Set<string>();
    state.friendRequests.forEach((r) => {
      if (r.status !== "accepted") return;
      if (r.fromMemberId === me) set.add(r.toMemberId);
      if (r.toMemberId === me) set.add(r.fromMemberId);
    });
    return [...set];
  }, [state.friendRequests, me]);

  const others = useMemo(
    () => state.memberProfiles.filter((m) => m.id !== me),
    [state.memberProfiles, me],
  );

  const name = (id: string) =>
    state.memberProfiles.find((m) => m.id === id)?.displayName ?? id;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          Requests for you
        </h2>
        {incoming.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">None right now.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {incoming.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
              >
                <span className="font-medium">{name(r.fromMemberId)}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      communityOntologyService.respondFriendRequest(
                        r.id,
                        true,
                      );
                      refresh();
                    }}
                    className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-bold text-[#04100e]"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      communityOntologyService.respondFriendRequest(
                        r.id,
                        false,
                      );
                      refresh();
                    }}
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs"
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          Your friends
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {friends.map((id) => (
            <li
              key={id}
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
            >
              <p className="font-semibold">{name(id)}</p>
              <p className="text-xs text-[var(--muted)]">
                @{state.memberProfiles.find((m) => m.id === id)?.username}
              </p>
            </li>
          ))}
        </ul>
        {friends.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            Accept a request or send one below.
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          Add friend
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Send a request (stored as{" "}
          <code className="text-[var(--accent)]">FriendRequest</code> in local
          Ontology JSON).
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <select
            className="min-w-[200px] flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            value={pick}
            onChange={(e) => setPick(e.target.value)}
          >
            <option value="">Choose member…</option>
            {others.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName} (@{m.username})
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={
              !pick ||
              areFriends(me, pick, state.friendRequests) ||
              hasPendingBetween(me, pick, state.friendRequests)
            }
            onClick={() => {
              if (!pick) return;
              communityOntologyService.sendFriendRequest(me, pick);
              refresh();
            }}
            className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[#04100e] disabled:opacity-40"
          >
            Send request
          </button>
        </div>
      </section>
    </div>
  );
}
