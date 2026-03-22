"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCommunity } from "@/hooks/useCommunity";
import { communityOntologyService } from "@/services/communityOntologyService";

export function ForumDetailClient({ forumId }: { forumId: string }) {
  const [state, refresh] = useCommunity();
  const me = state.currentMemberId;
  const forum = state.forums.find((f) => f.id === forumId);
  const threads = useMemo(
    () =>
      state.forumThreads
        .filter((t) => t.forumId === forumId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [state.forumThreads, forumId],
  );

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const name = (id: string) =>
    state.memberProfiles.find((m) => m.id === id)?.displayName ?? id;

  if (!forum) {
    return (
      <p className="text-[var(--muted)]">
        Forum not found.{" "}
        <Link href="/community/forums" className="text-[var(--accent)]">
          Back
        </Link>
      </p>
    );
  }

  return (
    <div>
      <Link
        href="/community/forums"
        className="text-sm text-[var(--accent)] hover:underline"
      >
        ← All forums
      </Link>
      <h2 className="mt-4 text-2xl font-semibold">{forum.title}</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">{forum.description}</p>

      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          New thread
        </h3>
        <input
          className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="mt-2 min-h-[80px] w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          placeholder="What’s on your mind?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            const t = title.trim();
            const b = body.trim();
            if (!t || !b) return;
            communityOntologyService.createForumThread({
              forumId,
              authorMemberId: me,
              title: t,
              body: b,
              createdAt: new Date().toISOString(),
            });
            setTitle("");
            setBody("");
            refresh();
          }}
          className="mt-3 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[#04100e]"
        >
          Post thread
        </button>
      </section>

      <ul className="mt-8 space-y-3">
        {threads.map((th) => (
          <li key={th.id}>
            <Link
              href={`/community/forums/${forumId}/${th.id}`}
              className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--accent-soft)]"
            >
              <h3 className="font-semibold">{th.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                {th.body}
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                {name(th.authorMemberId)} ·{" "}
                {new Date(th.createdAt).toLocaleString()} · {th.replyCount}{" "}
                replies
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
