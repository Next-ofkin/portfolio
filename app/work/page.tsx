import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SiteShell } from "@/components/SiteShell";
import { ProjectGrid } from "@/components/Work";
import { projects, siteUrl } from "@/lib/content";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Products Excel Shogbola has built: messaging infrastructure, loan verification, AML compliance, AI code intelligence and more.",
  alternates: { canonical: `${siteUrl}/work` },
};

export default function WorkPage() {
  return (
    <SiteShell>
      <PageHeader
        title="Work"
        intro="Products I've designed and shipped, from messaging infrastructure to fintech compliance. Three have full case studies."
      />
      <div className="pb-24 md:pb-36">
        <ProjectGrid items={projects} />
      </div>
    </SiteShell>
  );
}
