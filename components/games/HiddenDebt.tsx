"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBest } from "@/lib/useBest";

// Spot the hidden debt: bank statement lines scroll up. Tap the loan repayments before they slip off the top;
// leave everything else alone. A small taste of what VerifyFlow does in minutes. Lender names are made up.

const ROUND = 40;
const BEST_KEY = "hidden-debt-best";

const LENDERS = [
  "Kwik Kudi Loan",
  "SwiftNaira Credit",
  "Sharp Sharp Credit",
  "Easy Ajo Loan",
  "PayDay Plus debit",
  "OwoWise Credit",
  "MegaLoan NG",
];
const NORMAL = [
  "POS Shoprite Ikeja",
  "Transfer to Mama",
  "MTN airtime",
  "Bolt ride",
  "DSTV subscription",
  "Chicken Republic",
  "IKEDC prepaid",
  "Transfer from Tunde",
  "Jumia order",
  "ATM withdrawal",
  "Church offering",
  "Data bundle",
  "Mama Put jollof",
];

type Row = {
  id: number;
  label: string;
  amount: number;
  debt: boolean;
  dur: number;
  state: "live" | "caught" | "wrong";
};
type State = "idle" | "playing" | "done";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export function HiddenDebt() {
  const [state, setState] = useState<State>("idle");
  const [rows, setRows] = useState<Row[]>([]);
  const [found, setFound] = useState(0);
  const [missed, setMissed] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [time, setTime] = useState(ROUND);
  const [best, offerBest] = useBest(BEST_KEY);
  const [newBest, setNewBest] = useState(false);
  const foundRef = useRef(0);
  const [note, setNote] = useState<string | null>(null);
  const nextId = useRef(1);

  // spawn statement lines and count down
  useEffect(() => {
    if (state !== "playing") return;
    const started = performance.now();
    let timer = 0;
    const spawn = () => {
      const elapsed = (performance.now() - started) / 1000;
      if (elapsed >= ROUND) return;
      const debt = Math.random() < 0.32;
      const row: Row = {
        id: nextId.current++,
        label: debt ? pick(LENDERS) : pick(NORMAL),
        amount: debt ? 8000 + Math.round(Math.random() * 37) * 1000 : 500 + Math.round(Math.random() * 60) * 250,
        debt,
        dur: Math.max(3.2, 6.5 - elapsed * 0.08),
        state: "live",
      };
      setRows((r) => [...r, row]);
      timer = window.setTimeout(spawn, Math.max(420, 950 - elapsed * 14));
    };
    spawn();
    const clock = window.setInterval(() => {
      const left = Math.max(0, ROUND - Math.floor((performance.now() - started) / 1000));
      setTime(left);
      if (left <= 0) {
        window.clearInterval(clock);
        setRows([]);
        setNewBest(offerBest(foundRef.current));
        setState("done");
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(clock);
    };
  }, [state, offerBest]);

  const tap = useCallback((row: Row) => {
    if (row.state !== "live") return;
    if (row.debt) {
      foundRef.current += row.amount;
      setFound(foundRef.current);
      setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, state: "caught" } : r)));
      setNote(`Caught ${naira(row.amount)}`);
    } else {
      setWrong((w) => w + 1);
      setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, state: "wrong" } : r)));
      setNote(`That's just ${row.label.toLowerCase()}`);
    }
  }, []);

  const gone = useCallback((row: Row) => {
    setRows((rs) => rs.filter((r) => r.id !== row.id));
    if (row.debt && row.state === "live") setMissed((m) => m + row.amount);
  }, []);

  const start = () => {
    setRows([]);
    setFound(0);
    foundRef.current = 0;
    setNewBest(false);
    setMissed(0);
    setWrong(0);
    setTime(ROUND);
    setNote(null);
    setState("playing");
  };

  const total = found + missed;

  return (
    <div className="relative h-[26rem] overflow-hidden rounded-[1.5rem] border border-line bg-[#0b0b0b]">
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between border-b border-line bg-[#0b0b0b]/95 px-5 py-4 text-sm">
        <span>
          Found <span className="font-display text-lg font-semibold text-gold">{naira(found)}</span>
        </span>
        <span>
          <span className="font-display text-lg font-semibold text-ink">{time}</span>s
        </span>
      </div>

      {state === "playing" && (
        <>
          <p className="absolute inset-x-0 top-16 z-20 text-center text-sm text-muted" aria-live="polite">
            {note ?? "Tap the loan repayments. Leave the rest."}
          </p>
          <ul className="absolute inset-0" aria-label="Bank statement">
            {rows.map((r) => (
              <li
                key={r.id}
                className="debt-row absolute inset-x-4"
                style={{ animationDuration: `${r.dur}s` }}
                onAnimationEnd={() => gone(r)}
              >
                <button
                  type="button"
                  onPointerDown={() => tap(r)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && tap(r)}
                  className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition-colors ${
                    r.state === "caught"
                      ? "border-gold bg-gold/15 text-gold"
                      : r.state === "wrong"
                        ? "border-red-400/60 bg-red-500/10 text-red-300"
                        : "border-line bg-surface hover:border-line-strong"
                  }`}
                >
                  <span className="truncate">{r.label}</span>
                  <span className="shrink-0 font-medium">-{naira(r.amount)}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {state !== "playing" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-bg/75 px-6 pt-10 text-center backdrop-blur-[2px]">
          {state === "done" ? (
            <div aria-live="polite">
              <p className="font-display text-4xl font-semibold tracking-tight text-gold">{naira(found)}</p>
              <p className="mt-2 text-muted">
                of {naira(total)} in hidden repayments caught
                {wrong ? `, with ${wrong} wrong ${wrong === 1 ? "tap" : "taps"}` : ""}.
                {newBest ? " New best." : ""}
              </p>
              <p className="mx-auto mt-4 max-w-sm">
                VerifyFlow reads the whole statement and catches every one, in minutes.{" "}
                <Link href="/work/verifyflow" className="underline decoration-gold underline-offset-4">
                  See how
                </Link>
              </p>
            </div>
          ) : (
            <p className="max-w-sm text-muted">
              A borrower&apos;s statement scrolls past. Tap every loan repayment before it slips away. Don&apos;t tap
              the jollof.
            </p>
          )}
          <button
            type="button"
            onClick={start}
            className="rounded-full bg-accent-strong px-7 py-3 font-medium text-white transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {state === "done" ? "Play again" : "Start"}
          </button>
          {best > 0 && state === "idle" && <p className="text-sm text-muted">Your best: {naira(best)}</p>}
        </div>
      )}
    </div>
  );
}
