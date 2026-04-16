"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";

const SESSION_STORAGE_KEY = "racer:aip:matchmaker:sessionRid";

type Role = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
};

export const FIND_RACE_PROMPT = "FIND ME A RACE";

export type MatchmakerChatProps = {
  /** Close control for modal overlays */
  onClose?: () => void;
  /** Tighter layout when embedded over the map */
  variant?: "full" | "compact";
  /** From `/matchmaker?oauth=missing` when sign-in could not start (env incomplete) */
  oauthConfigHint?: boolean;
};

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function MatchmakerChat({
  onClose,
  variant = "full",
  oauthConfigHint = false,
}: MatchmakerChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionRid, setSessionRid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [envNotConfigured, setEnvNotConfigured] = useState(oauthConfigHint);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved?.trim()) setSessionRid(saved.trim());
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    if (oauthConfigHint) setEnvNotConfigured(true);
  }, [oauthConfigHint]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/matchmaker");
        const data = (await res.json()) as {
          foundryOAuthReady?: boolean;
        };
        if (!cancelled && data.foundryOAuthReady === false) {
          setEnvNotConfigured(true);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendText = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || loading) return;

      setError(null);
      setNeedsSignIn(false);
      const userMsg: ChatMessage = { id: newId(), role: "user", content: text };
      setMessages((m) => [...m, userMsg]);
      setLoading(true);

      try {
        const res = await fetch("/api/matchmaker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            message: text,
            sessionRid: sessionRid ?? undefined,
          }),
        });

        const data = (await res.json()) as {
          reply?: string;
          sessionRid?: string;
          error?: string;
          description?: string;
          signInPath?: string;
        };

        if (res.status === 401 && data.signInPath) {
          setNeedsSignIn(true);
          setMessages((m) => [
            ...m,
            {
              id: newId(),
              role: "assistant",
              content:
                "**Session required.** Sign in with Foundry (PKCE) so this app can call your AIP agent with your access token. After redirect, come back and send again.",
            },
          ]);
          return;
        }

        if (!res.ok) {
          throw new Error(
            data.description || data.error || `Request failed (${res.status})`,
          );
        }

        if (data.sessionRid) {
          setSessionRid(data.sessionRid);
          try {
            sessionStorage.setItem(SESSION_STORAGE_KEY, data.sessionRid);
          } catch {
            /* ignore */
          }
        }

        setMessages((m) => [
          ...m,
          {
            id: newId(),
            role: "assistant",
            content: data.reply?.trim() || "_(empty response)_",
          },
        ]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Network error";
        setError(msg);
        setMessages((m) => [
          ...m,
          {
            id: newId(),
            role: "assistant",
            content: `**Uplink failed.** ${msg}`,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, sessionRid],
  );

  const compact = variant === "compact";

  const mdComponents = useMemo(
    () => ({
      a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-cyan-400 underline decoration-cyan-500/50 underline-offset-2 hover:text-cyan-300"
        >
          {children}
        </a>
      ),
      p: ({ children }: { children?: React.ReactNode }) => (
        <p className="mb-2 last:mb-0">{children}</p>
      ),
      ul: ({ children }: { children?: React.ReactNode }) => (
        <ul className="mb-2 list-disc space-y-1 pl-4">{children}</ul>
      ),
      ol: ({ children }: { children?: React.ReactNode }) => (
        <ol className="mb-2 list-decimal space-y-1 pl-4">{children}</ol>
      ),
      li: ({ children }: { children?: React.ReactNode }) => (
        <li className="leading-relaxed">{children}</li>
      ),
      strong: ({ children }: { children?: React.ReactNode }) => (
        <strong className="font-semibold text-zinc-50">{children}</strong>
      ),
      code: ({ className, children }: { className?: string; children?: React.ReactNode }) => {
        const isBlock = className?.includes("language-");
        if (isBlock) {
          return (
            <pre className="mb-2 overflow-x-auto rounded-lg border border-fuchsia-500/25 bg-black/50 p-3 text-[0.8rem] leading-relaxed">
              <code>{children}</code>
            </pre>
          );
        }
        return (
          <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-cyan-200">
            {children}
          </code>
        );
      },
    }),
    [],
  );

  return (
    <div
      className={`relative mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-fuchsia-500/35 bg-[#07060c] shadow-[0_0_60px_-12px_rgba(217,70,239,0.45),0_0_80px_-24px_rgba(34,211,238,0.25)] ${compact ? "max-h-[min(85dvh,620px)] flex flex-col" : ""}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(217,70,239,0.1) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative shrink-0 border-b border-cyan-500/25 bg-gradient-to-r from-fuchsia-950/80 via-[#0c0a12] to-cyan-950/70 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.35em] text-cyan-300/90">
              AIP // Matchmaker
            </p>
            <h2 className="mt-1 bg-gradient-to-r from-fuchsia-200 via-white to-cyan-200 bg-clip-text font-semibold tracking-tight text-transparent">
              Neon grid relay
            </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Foundry AIP agent (PKCE) ·{" "}
          <a
            href="/auth/signin"
            className="text-cyan-400/90 underline-offset-2 hover:underline"
          >
            Sign in
          </a>{" "}
          ·{" "}
          <a
            href="/auth/signout"
            className="text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
          >
            Sign out
          </a>
        </p>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg border border-fuchsia-500/40 bg-black/40 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-fuchsia-200/90 transition-colors hover:border-cyan-400/50 hover:text-cyan-200"
              aria-label="Close matchmaker"
            >
              Esc
            </button>
          ) : null}
        </div>

        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 380, damping: 24 }}
        >
          <motion.button
            type="button"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            onClick={() => void sendText(FIND_RACE_PROMPT)}
            className="group relative w-full overflow-hidden rounded-xl border border-cyan-400/50 bg-black/60 py-3.5 text-center font-mono text-sm font-bold uppercase tracking-[0.2em] text-cyan-200 shadow-[0_0_32px_-4px_rgba(34,211,238,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors hover:border-fuchsia-400/60 hover:text-fuchsia-100 hover:shadow-[0_0_40px_-4px_rgba(217,70,239,0.4)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                background:
                  "linear-gradient(105deg, transparent 0%, rgba(34,211,238,0.12) 45%, rgba(217,70,239,0.15) 55%, transparent 100%)",
              }}
            />
            <span className="relative">{FIND_RACE_PROMPT}</span>
          </motion.button>
        </motion.div>
      </div>

      {envNotConfigured ? (
        <div className="relative shrink-0 border-b border-zinc-600/40 bg-zinc-900/80 px-4 py-3 text-left text-xs leading-relaxed text-zinc-400">
          <p className="font-semibold text-zinc-200">Demo: Foundry OAuth not configured</p>
          <p className="mt-1">
            Copy{" "}
            <code className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-[0.7rem] text-cyan-300/90">
              .env.example
            </code>{" "}
            to{" "}
            <code className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-[0.7rem] text-cyan-300/90">
              .env.local
            </code>{" "}
            and set <span className="text-zinc-300">FOUNDRY_URL</span> and{" "}
            <span className="text-zinc-300">FOUNDRY_CLIENT_ID</span>, then restart{" "}
            <code className="font-mono text-[0.7rem] text-zinc-500">npm run dev</code>.
          </p>
        </div>
      ) : null}

      {needsSignIn ? (
        <div className="relative shrink-0 border-b border-amber-500/35 bg-amber-950/50 px-4 py-3 text-center">
          <p className="text-xs text-amber-100/90">
            The matchmaker needs a Foundry access token in this browser.
          </p>
          <Link
            href="/auth/signin"
            className="mt-2 inline-flex rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(245,158,11,0.35)]"
          >
            Sign in with Foundry
          </Link>
        </div>
      ) : null}

      <div
        ref={listRef}
        className={`relative min-h-0 space-y-3 overflow-y-auto px-4 py-4 [scrollbar-color:rgba(192,38,211,0.35)_transparent] ${compact ? "max-h-[min(38vh,300px)] min-h-[140px] flex-1" : "max-h-[min(52vh,420px)] min-h-[220px]"}`}
      >
        {messages.length === 0 && !loading ? (
          <p className="py-6 text-center text-sm italic text-zinc-600">
            Hit{" "}
            <span className="font-mono text-fuchsia-400/90">
              {FIND_RACE_PROMPT}
            </span>{" "}
            above or type your own hail on the wire.
          </p>
        ) : null}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={
                  msg.role === "user"
                    ? "max-w-[88%] rounded-2xl rounded-br-md border border-cyan-500/40 bg-cyan-950/50 px-3.5 py-2.5 text-sm text-cyan-50 shadow-[0_0_24px_-4px_rgba(34,211,238,0.35)]"
                    : "max-w-[92%] rounded-2xl rounded-bl-md border border-fuchsia-500/30 bg-[#100e18] px-3.5 py-2.5 text-sm leading-relaxed text-zinc-200 shadow-[0_0_28px_-6px_rgba(217,70,239,0.25)]"
                }
              >
                {msg.role === "assistant" ? (
                  <div className="break-words font-[system-ui] text-[0.925rem] leading-relaxed [&_pre]:max-w-full">
                    <ReactMarkdown components={mdComponents}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap break-words font-[system-ui]">
                    {msg.content}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {loading ? (
            <motion.div
              key="think"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-2 rounded-full border border-fuchsia-500/25 bg-black/50 px-4 py-2 text-xs font-medium text-fuchsia-200/90">
                <motion.span className="inline-flex gap-1" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-cyan-400"
                      animate={{
                        opacity: [0.25, 1, 0.25],
                        scale: [0.85, 1.15, 0.85],
                      }}
                      transition={{
                        duration: 1.1,
                        repeat: Infinity,
                        delay: i * 0.18,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </motion.span>
                Foundry agent compiling…
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {error ? (
        <p className="shrink-0 border-t border-red-500/20 bg-red-950/30 px-4 py-2 text-center text-xs text-red-300/90">
          {error}
        </p>
      ) : null}

      <form
        className={`relative shrink-0 border-t border-cyan-500/20 bg-[#050408] p-4 ${compact ? "pb-[max(1rem,env(safe-area-inset-bottom))]" : ""}`}
        onSubmit={(e) => {
          e.preventDefault();
          const t = input.trim();
          if (!t) return;
          setInput("");
          void sendText(t);
        }}
      >
        <div
          className="rounded-xl p-[1px] transition-shadow duration-300 focus-within:shadow-[0_0_28px_-4px_rgba(34,211,238,0.55),0_0_40px_-8px_rgba(217,70,239,0.35)]"
          style={{
            background:
              "linear-gradient(120deg, rgba(34,211,238,0.65), rgba(217,70,239,0.5), rgba(34,211,238,0.45))",
          }}
        >
          <div className="flex gap-2 rounded-[11px] bg-[#0a0810] p-1.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Try “${FIND_RACE_PROMPT}” or any hail…`}
              disabled={loading}
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none"
              autoComplete="off"
            />
            <motion.button
              type="submit"
              disabled={loading || !input.trim()}
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              className="shrink-0 rounded-lg bg-gradient-to-br from-cyan-500 to-fuchsia-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:cursor-not-allowed disabled:opacity-35"
            >
              Send
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
}
