import { Suspense } from "react";
import { profile } from "@/lib/content";
import { getContributions, getRepos } from "@/lib/github";
import { ContributionGraph } from "./ContributionGraph";
import { RepoList } from "./RepoList";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

const linkClass =
  "font-medium underline decoration-line-strong decoration-2 underline-offset-[6px] transition-colors hover:decoration-gold";

function Fallback({ what }: { what: string }) {
  return (
    <p className="text-muted">
      {what} couldn&apos;t load right now.{" "}
      <a href={profile.github} target="_blank" rel="noopener" className={linkClass}>
        See it on GitHub<span className="sr-only"> (opens in a new tab)</span>
      </a>
    </p>
  );
}

function Skeleton({ height }: { height: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-2xl bg-surface ${height}`} />;
}

async function Contributions() {
  const data = await getContributions();
  if (!data.ok) return <Fallback what="The contribution graph" />;
  return <ContributionGraph days={data.days} total={data.total} />;
}

async function Repos() {
  const data = await getRepos();
  if (!data.ok) return <Fallback what="The repository list" />;
  if (data.repos.length === 0) return <p className="text-muted">No public repositories yet.</p>;
  return <RepoList repos={data.repos} profileUrl={profile.github} />;
}

export function GithubSection() {
  return (
    <Section
      id="open-source"
      title="Open source"
      intro={`Live from github.com/${profile.githubUser}. Public repositories and activity, refreshed hourly.`}
    >
      <div className="space-y-20">
        <Reveal>
          <Suspense fallback={<Skeleton height="h-48" />}>
            <Contributions />
          </Suspense>
        </Reveal>
        <Reveal>
          <Suspense fallback={<Skeleton height="h-96" />}>
            <Repos />
          </Suspense>
        </Reveal>
      </div>
    </Section>
  );
}
