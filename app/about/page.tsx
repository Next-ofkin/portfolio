import type { Metadata } from "next";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { GithubSection } from "@/components/GithubSection";
import { PageHeader } from "@/components/PageHeader";
import { SiteShell } from "@/components/SiteShell";
import { Skills } from "@/components/Skills";
import { siteUrl } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Excel Shogbola is a full-stack engineer in Lagos: founder of Lumenware Technologies and a fintech engineer at NOLT Finance.",
  alternates: { canonical: `${siteUrl}/about` },
};

export default function AboutPage() {
  return (
    <SiteShell>
      <PageHeader
        title="About"
        intro="Full-stack engineer and AI systems builder in Lagos, Nigeria. Open to remote work."
      />
      <About />
      <Experience />
      <Skills />
      <GithubSection />
    </SiteShell>
  );
}
