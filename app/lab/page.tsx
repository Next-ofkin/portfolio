import type { Metadata } from "next";
import { HiddenDebt } from "@/components/games/HiddenDebt";
import { Pluck } from "@/components/games/Pluck";
import { PageHeader } from "@/components/PageHeader";
import { ParticleField } from "@/components/ParticleField";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { SignatureSection } from "@/components/signatures/SignatureSection";
import { SiteShell } from "@/components/SiteShell";
import { Workshop } from "@/components/Workshop";
import { siteUrl } from "@/lib/content";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Excel Shogbola's playground: a particle field you can move with your hands, two small games, a visitor signature wall, and what he's building next.",
  alternates: { canonical: `${siteUrl}/lab` },
};

const jump = [
  { href: "#games", label: "Games" },
  { href: "#wall", label: "Signature wall" },
  { href: "#workshop", label: "In the workshop" },
  { href: "#particles", label: "Particles" },
];

export default function LabPage() {
  return (
    <SiteShell>
      <PageHeader
        title="Lab"
        intro="Where I play. Two small games, a wall to leave your signature on, and what I'm building next."
      >
        <nav aria-label="On this page" className="hero-in mt-10">
          <ul className="flex flex-wrap gap-2">
            {jump.map((j) => (
              <li key={j.href}>
                <a
                  href={j.href}
                  className="block rounded-full border border-line-strong px-4 py-2 transition-colors hover:border-gold hover:text-gold"
                >
                  {j.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>

      <Section id="games" title="Games" intro="Thirty to forty seconds each. Your best score stays on this device.">
        <div className="grid gap-10 md:grid-cols-2 md:gap-6">
          <Reveal>
            <h3 className="font-display text-2xl font-semibold tracking-tight">Pluck</h3>
            <p className="mt-1 mb-5 text-muted">Hit the notes on the six strings as they cross the line.</p>
            <Pluck />
          </Reveal>
          <Reveal delay={90}>
            <h3 className="font-display text-2xl font-semibold tracking-tight">Spot the hidden debt</h3>
            <p className="mt-1 mb-5 text-muted">Catch the loan repayments hiding in a bank statement.</p>
            <HiddenDebt />
          </Reveal>
        </div>
      </Section>

      <Section
        id="wall"
        title="Signature wall"
        intro="Leave your mark. Every signature floats here once I've had a quick look at it."
      >
        <Reveal>
          <SignatureSection />
        </Reveal>
      </Section>

      <Section id="workshop" title="In the workshop" intro="What I'm building now. The statuses are honest.">
        <Workshop />
      </Section>

      <Section
        id="particles"
        title="Particles"
        intro="Push the particles around, or switch on your camera and do it with your hands, the way Hand Graph works."
      >
        <Reveal>
          <ParticleField />
        </Reveal>
      </Section>
    </SiteShell>
  );
}
