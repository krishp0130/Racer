"use client";

import { useMemo, useState } from "react";
import { useCommunity } from "@/hooks/useCommunity";
import { communityOntologyService } from "@/services/communityOntologyService";

export function MessagesPageClient() {
  const [state, refresh] = useCommunity();
  const me = state.currentMemberId;
  const [activeId, setActiveId] = useState<string>("dm-krish-neon");
  const [draft, setDraft] = useState("");

  const name = (id: string) =>
    state.memberProfiles.find((m) => m.id === id)?.displayName ?? id;

  const rows = useMemo(() => {
    const n = (id: string) =>
      state.memberProfiles.find((m) => m.id === id)?.displayName ?? id;
    const dms = state.directConversations
      .filter((c) => c.participantIds.includes(me))
      .map((c) => ({
        id: c.id,
        kind: "dm" as const,
        title: c.participantIds
          .filter((p) => p !== me)
          .map((p) => n(p))
          .join(", "),
        last: c.lastMessageAt,
      }));
    const grps = state.groupConversations.map((g) => ({
      id: g.id,
      kind: "group" as const,
      title: g.name,
      last: g.lastMessageAt,
    }));
    return [...dms, ...grps].sort(
      (a, b) => new Date(b.last).getTime() - new Date(a.last).getTime(),
    );
  }, [state.directConversations, state.groupConversations, me, state.memberProfiles]);

  const messages = useMemo(
    () =>
      [...state.chatMessages]
        .filter((m) => m.conversationId === activeId)
        .sort(
          (a, b) =>
            new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
        ),
    [state.chatMessages, activeId],
  );

  const send = () => {
    const t = draft.trim();
    if (!t || !activeId) return;
    communityOntologyService.sendChatMessage(activeId, me, t);
    setDraft("");
    refresh();
  };

  return (
    <div className="grid min-h-[420px] gap-4 lg:grid-cols-[min(320px,36%)_1fr]">
      <aside className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
        <h2 className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Direct & groups
        </h2>
        <ul className="space-y-1">
          {rows.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setActiveId(r.id)}
                className={`flex w-full flex-col rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                  activeId === r.id
                    ? "bg-[var(--accent-glow)] text-[var(--accent)]"
                    : "hover:bg-white/5"
                }`}
              >
                <span className="font-semibold">{r.title}</span>
                <span className="text-[0.65rem] uppercase tracking-wide text-[var(--muted)]">
                  {r.kind}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="max-h-[min(52vh,520px)] flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-2xl border border-[var(--border)] px-4 py-2 text-sm ${
                m.senderMemberId === me
                  ? "ml-auto bg-[var(--accent-glow)] text-[var(--foreground)]"
                  : "bg-[var(--background)]"
              }`}
            >
              <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                {name(m.senderMemberId)}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
              <p className="mt-1 text-[0.6rem] text-[var(--muted)]">
                {new Date(m.sentAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-[var(--border)] p-3">
          <div className="flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              placeholder="Message…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button
              type="button"
              onClick={send}
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[#04100e]"
            >
              Send
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
