import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { SignatureSvg } from "@/components/SignatureSvg";
import { SiteShell } from "@/components/SiteShell";
import { checkToken, getApprovedOne, getPending, signaturesOpen, validId } from "@/lib/signatures";

export const metadata: Metadata = { title: "Review a signature", robots: { index: false, follow: false } };

const DONE: Record<string, string> = {
  approved: "Approved. It's floating on the wall now.",
  removed: "Deleted. It won't appear on the wall.",
  missing: "That signature was already handled.",
  invalid: "That review link isn't valid. Open the link from the email again.",
  error: "Something went wrong talking to storage. Please try again.",
};

const button =
  "rounded-full px-7 py-3 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

async function Review({ searchParams }: { searchParams: PageProps<"/lab/review">["searchParams"] }) {
  await connection(); // storage reads happen per request, never at build time
  const q = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const done = one(q.done);
  if (done) {
    return (
      <div>
        <p className="text-2xl">{DONE[done] ?? DONE.invalid}</p>
        <Link href="/lab#wall" className="mt-6 inline-block underline decoration-gold underline-offset-4">
          See the wall
        </Link>
      </div>
    );
  }
  const id = one(q.id);
  const t = one(q.t);
  if (!signaturesOpen() || !validId(id) || !checkToken(id, t)) return <p className="text-2xl">{DONE.invalid}</p>;

  const pending = await getPending(id);
  const live = pending ? null : await getApprovedOne(id);
  const sig = pending ?? live;
  if (!sig) return <p className="text-2xl">{DONE.missing}</p>;

  return (
    <div className="max-w-2xl">
      <p className="text-muted">
        {sig.name ? <span className="text-ink">{sig.name}</span> : "Someone without a name"} signed on{" "}
        {new Date(sig.createdAt).toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Africa/Lagos",
        })}
        . {live ? "It's on the wall now." : "It isn't on the wall yet."}
      </p>
      <div className="mt-6 rounded-[1.5rem] border border-line bg-[#0b0b0b] p-6">
        <SignatureSvg sig={sig} className="h-auto w-full" />
      </div>
      <form method="post" action="/api/signatures/review" className="mt-8 flex flex-wrap gap-3">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="t" value={t} />
        {pending && (
          <button
            name="action"
            value="approve"
            className={`${button} bg-accent-strong text-white hover:bg-accent focus-visible:outline-accent`}
          >
            Approve
          </button>
        )}
        <button
          name="action"
          value="reject"
          className={`${button} border border-line-strong hover:border-red-400 hover:text-red-300 focus-visible:outline-red-400`}
        >
          {live ? "Remove from the wall" : "Delete"}
        </button>
      </form>
    </div>
  );
}

export default function ReviewPage({ searchParams }: PageProps<"/lab/review">) {
  return (
    <SiteShell>
      <section className="py-20 md:py-28">
        <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-none tracking-[-0.045em]">
          Review a signature
        </h1>
        <div className="mt-10">
          <Suspense fallback={<p className="text-muted">Loading the signature…</p>}>
            <Review searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </SiteShell>
  );
}
