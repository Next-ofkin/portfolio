"use client";

import { useState, type FormEvent } from "react";
import { profile } from "@/lib/content";

type Status = "idle" | "sending" | "sent" | "error";

const field =
  "mt-2 w-full rounded-xl border border-line-strong bg-raised px-4 py-3.5 text-base text-ink placeholder:text-muted/70 transition-colors focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [openedAt, setOpenedAt] = useState(() => performance.now());

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          company: data.get("company"),
          elapsed: Math.round(performance.now() - openedAt),
        }),
      });
      const json: { ok?: boolean; error?: string } = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setError(json.error ?? `Something went wrong. Please email ${profile.email} instead.`);
        setStatus("error");
        return;
      }
      form.reset();
      setStatus("sent");
    } catch {
      setError(`Couldn't reach the server. Check your connection, or email ${profile.email} instead.`);
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-3xl border border-gold/40 bg-surface p-8 md:p-10">
        <p className="font-display text-3xl font-semibold tracking-tight">Message sent.</p>
        <p className="mt-3 text-lg text-muted">Thank you. I&apos;ll reply to the email address you gave.</p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setOpenedAt(performance.now());
          }}
          className="mt-6 rounded-full border border-line-strong px-5 py-2.5 text-sm font-medium transition-colors hover:border-gold hover:text-gold"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="font-medium">
          Name
        </label>
        <input id="name" name="name" type="text" required maxLength={100} autoComplete="name" className={field} />
      </div>
      <div>
        <label htmlFor="email" className="font-medium">
          Email
        </label>
        <input id="email" name="email" type="email" required maxLength={200} autoComplete="email" className={field} />
      </div>
      <div>
        <label htmlFor="message" className="font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={6}
          className={`${field} resize-y`}
        />
      </div>

      {/* Honeypot: people never see or fill this. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex h-12 items-center rounded-full bg-accent-strong px-8 text-base font-semibold text-white transition-colors hover:bg-accent disabled:opacity-60"
        >
          {status === "sending" ? "Sending..." : "Send message"}
        </button>
        <p role="alert" className="min-h-6 text-base text-gold">
          {status === "error" ? error : ""}
        </p>
      </div>
    </form>
  );
}
