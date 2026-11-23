import { profile } from "@/lib/content";
import { ContactForm } from "./ContactForm";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

const links = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}`, external: false },
  { label: "GitHub", value: "github.com/Next-ofkin", href: profile.github, external: true },
  { label: "LinkedIn", value: "excel-shogbola", href: profile.linkedin, external: true },
  { label: "X", value: profile.xHandle, href: profile.x, external: true },
];

export function Contact() {
  return (
    <Section
      id="contact"
      title="Contact"
      intro="Hiring, collaborating, or have a product in mind? Send a message and I'll reply by email."
    >
      <div className="grid gap-14 md:grid-cols-12 md:gap-8">
        <Reveal className="md:col-span-5">
          <ul className="divide-y divide-line border-y border-line">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  {...(l.external ? { target: "_blank", rel: "noopener" } : {})}
                  className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-5"
                >
                  <span className="text-muted">{l.label}</span>
                  <span className="break-all font-display text-xl font-medium tracking-tight transition-colors group-hover:text-gold">
                    {l.value}
                    {l.external && <span className="sr-only"> (opens in a new tab)</span>}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={120} className="md:col-span-6 md:col-start-7">
          <ContactForm />
        </Reveal>
      </div>
    </Section>
  );
}
