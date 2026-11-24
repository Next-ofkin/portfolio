"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What has Excel built in fintech?",
  "Is he open to remote work?",
  "What's his main tech stack?",
  "How did Excel find hidden debts in VerifyFlow?",
];

// Turn markdown links, bare links and email addresses in an answer into real links.
const SITE = /^https?:\/\/(www\.)?portfolio\.dastrings\.name\.ng/;
function Linked({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]\n]+\]\([^)\s]+\)|https?:\/\/[^\s)]+[^\s).,]|[\w.+-]+@[\w-]+\.[\w.]+[a-z])/gi);
  const link = "underline decoration-gold underline-offset-2";
  return (
    <>
      {parts.map((p, i) => {
        const md = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(p);
        if (md) {
          const href = md[2].startsWith("mailto:") || /^https?:|^\//.test(md[2]) ? md[2] : `/${md[2]}`;
          const external = /^https?:/.test(href) && !SITE.test(href);
          return (
            <a
              key={i}
              href={href.replace(SITE, "") || "/"}
              className={link}
              {...(external ? { target: "_blank", rel: "noopener" } : {})}
            >
              {md[1]}
            </a>
          );
        }
        if (/^https?:\/\//.test(p)) {
          const local = SITE.test(p);
          return (
            <a
              key={i}
              href={local ? p.replace(SITE, "") || "/" : p}
              className={`break-all ${link}`}
              {...(local ? {} : { target: "_blank", rel: "noopener" })}
            >
              {local ? p.replace(SITE, "") || "/" : p}
            </a>
          );
        }
        if (/@/.test(p) && /\.\w+$/.test(p)) {
          return (
            <a key={i} href={`mailto:${p}`} className={link}>
              {p}
            </a>
          );
        }
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}

// An answer: text with links, and any ``` fenced code shown as a small code block. `inline code` gets a tint.
function Answer({ text }: { text: string }) {
  const parts = text.split(/```[\w+-]*\n?([\s\S]*?)(?:```|$)/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <pre
            key={i}
            className="my-2 overflow-x-auto rounded-xl border border-line bg-bg px-3 py-2.5 font-mono text-[0.8rem] leading-relaxed text-ink/90"
          >
            <code>{part.replace(/\n$/, "")}</code>
          </pre>
        ) : (
          <span key={i} className="whitespace-pre-wrap">
            {part.split(/(`[^`\n]+`)/g).map((seg, j) =>
              /^`[^`]+`$/.test(seg) ? (
                <code key={j} className="rounded bg-bg px-1 py-0.5 font-mono text-[0.85em] break-all text-accent-soft">
                  {seg.slice(1, -1)}
                </code>
              ) : (
                <Linked key={j} text={seg.replace(/\*\*(.+?)\*\*/g, "$1")} />
              ),
            )}
          </span>
        ),
      )}
    </>
  );
}

// "Ask about Excel": a small assistant that answers from this site, Excel's CV and his code.
export function AskWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    field.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [msgs, busy]);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    setError(null);
    setInput("");
    const history: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs([...history, { role: "assistant", content: "" }]);
    setBusy(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-8) }),
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `The assistant couldn't answer right now (error ${res.status}).`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMsgs([...history, { role: "assistant", content: answer }]);
      }
      if (!answer.trim()) throw new Error("The assistant sent an empty answer. Please try again.");
    } catch (e) {
      setMsgs(history.slice(0, -1));
      setInput(q);
      setError(e instanceof Error ? e.message : "The assistant couldn't answer right now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        ref={toggle}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="ask-panel"
        className={`fixed right-4 bottom-4 z-[60] flex items-center gap-2.5 rounded-full border border-line-strong bg-surface/95 px-5 py-3 font-medium shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur transition-colors hover:border-gold md:right-6 md:bottom-6 ${
          open ? "hidden md:flex" : ""
        }`}
      >
        <span aria-hidden="true" className="pulse-dot h-2 w-2 rounded-full bg-gold" />
        {open ? "Close" : "Ask about Excel"}
      </button>

      {open && (
        <div
          id="ask-panel"
          ref={panel}
          role="dialog"
          aria-label="Ask about Excel"
          className="fixed inset-x-0 bottom-0 z-[60] flex max-h-[85svh] flex-col rounded-t-[1.75rem] border border-line-strong bg-surface shadow-[0_-10px_60px_rgba(0,0,0,0.6)] md:inset-x-auto md:right-6 md:bottom-24 md:h-[36rem] md:max-h-[calc(100svh-8rem)] md:w-[26rem] md:rounded-[1.75rem]"
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <p className="font-display text-lg font-semibold tracking-tight">Ask about Excel</p>
              <p className="text-xs text-muted">
                An AI that answers from this site and Excel&apos;s code. It can be wrong.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                toggle.current?.focus();
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong"
            >
              <span className="sr-only">Close</span>
              <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
                <path d="M1 1L13 13M13 1L1 13" stroke="#f5f5f4" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div ref={log} className="min-h-40 flex-1 space-y-4 overflow-y-auto px-5 py-5" aria-live="polite">
            {msgs.length === 0 && (
              <div>
                <p className="text-muted">
                  Hi. Ask me about Excel&apos;s work, skills or projects, even how he built something. For anything
                  else, the{" "}
                  <Link href="/contact" className="underline decoration-gold underline-offset-2">
                    Contact page
                  </Link>{" "}
                  reaches him directly.
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => ask(s)}
                        className="rounded-full border border-line-strong px-3.5 py-1.5 text-left text-sm transition-colors hover:border-gold hover:text-gold"
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {msgs.map((m, i) =>
              m.role === "user" ? (
                <p
                  key={i}
                  className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-accent-strong px-4 py-2.5 text-white"
                >
                  {m.content}
                </p>
              ) : (
                <div key={i} className="max-w-[96%] leading-relaxed text-ink/90">
                  {m.content ? (
                    <Answer text={m.content} />
                  ) : (
                    <span className="text-muted">Looking through Excel&apos;s work…</span>
                  )}
                </div>
              ),
            )}
            {error && <p className="text-sm text-red-300">{error}</p>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-end gap-2 border-t border-line p-3"
          >
            <label htmlFor="ask-input" className="sr-only">
              Your question
            </label>
            <textarea
              id="ask-input"
              ref={field}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(input);
                }
              }}
              rows={1}
              maxLength={600}
              placeholder="Ask a question"
              className="max-h-32 min-h-12 flex-1 resize-none rounded-2xl border border-line-strong bg-bg px-4 py-3 text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="h-12 rounded-full bg-accent-strong px-5 font-medium text-white transition-colors hover:bg-accent disabled:opacity-40"
            >
              Ask
            </button>
          </form>
        </div>
      )}
    </>
  );
}
