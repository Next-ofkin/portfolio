import type { Metadata } from "next";
import { Contact } from "@/components/Contact";
import { PageHeader } from "@/components/PageHeader";
import { SiteShell } from "@/components/SiteShell";
import { siteUrl } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Hire Excel Shogbola, collaborate, or talk about a product. Messages go straight to his inbox.",
  alternates: { canonical: `${siteUrl}/contact` },
};

export default function ContactPage() {
  return (
    <SiteShell>
      <PageHeader
        title="Contact"
        intro="Hiring, collaborating, or have a product in mind? I reply to every message by email."
      />
      <Contact />
    </SiteShell>
  );
}
