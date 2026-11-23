import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { LabTeaser } from "@/components/LabTeaser";
import { NowBuilding } from "@/components/NowBuilding";
import { SiteShell } from "@/components/SiteShell";
import { FeaturedWork } from "@/components/Work";

export default function Home() {
  return (
    <SiteShell>
      <Hero />
      <NowBuilding />
      <About short />
      <FeaturedWork />
      <LabTeaser />
      <Contact />
    </SiteShell>
  );
}
