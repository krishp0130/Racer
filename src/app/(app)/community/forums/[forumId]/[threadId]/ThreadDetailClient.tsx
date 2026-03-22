"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCommunity } from "@/hooks/useCommunity";
import { communityOntologyService } from "@/services/communityOntologyService";

export function ThreadDetailClient({
  forumId,
  threadId,
}: {
  forumId: string;
  threadId: string;
}) {
  const [state, refresh] = useCommunity();
  const me = state.currentMemberId;
  const [reply, setReply] = useState("");

  const thread = state.forumThreads.find((t) => t.id === threadId);
  const forum = state.forums.find((f) => f.id === forumId);

  const replies = useMemo(
    () =>
      state.forumReplies
        .filter((r) => r.threadId === threadId)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
    [state.forumReplies, threadId],
  );

  const name = (id: string) =>
    state.memberProfiles.find((m) => m.id === id)?.displayName ?? id;

  if (!thread || !forum) {
    return (
      <p className="text-[var(--muted)]">
        Thread not found.{" "}
        <Link href="/community/forums" className="text-[var(--accent)]">
          Forums
        </Link>
      </p>
    );
  }

  return (
    <div>
      <Link
        href={`/community/forums/${forumId}`}
        className="text-sm text-[var(--accent)] hover:underline"
      >
        ← {forum.title}
      </Link>
      <article className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h1 className="text-2xl font-semibold">{thread.title}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {name(thread.authorMemberId)} ·{" "}
          {new Date(thread.createdAt).toLocaleString()}
        </p>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
          {thread.body}
        </p>
      </article>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          Replies
        </h2>
        <ul className="mt-4 space-y-3">
          {replies.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <p className="text-xs text-[var(--muted)]">
                {name(r.authorMemberId)} ·{" "}
                {new Date(r.createdAt).toLocaleString()}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{r.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h3 className="text-sm font-semibold text-[var(--muted)]">
          Your reply
        </h3>
        <textarea
          className="mt-3 min-h-[100px] w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            const t = reply.trim();
            if (!t) return;
            communityOntologyService.addForumReply({
              threadId,
              authorMemberId: me,
              body: t,
              createdAt: new Date().toISOString(),
            });
            setReply("");
            refresh();
          }}
          className="mt-3 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[#04100e]"
        >
          Post reply
        </button>
      </section>
    </div>
  );
}
