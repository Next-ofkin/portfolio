import type { Metadata, Viewport } from "next";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@fontsource-variable/inter";
import "./globals.css";
import { profile, siteUrl } from "@/lib/content";

const title = `${profile.name} | ${profile.title}`;
// Written in the third person with name and city, because this is the sentence Google and AI assistants quote.
const description = `${profile.name} is a full-stack engineer and AI systems builder in Lagos, Nigeria. He designs and ships production SaaS, fintech infrastructure and AI-powered products for African businesses.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s | ${profile.name}` },
  description,
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  openGraph: {
    type: "profile",
    firstName: "Excel",
    lastName: "Shogbola",
    username: profile.githubUser,
    url: siteUrl,
    siteName: profile.name,
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description, creator: profile.xHandle },
};

// Tells search engines and link previews who this site belongs to.
const person = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  url: siteUrl,
  image: `${siteUrl}/excel-shogbola.webp`,
  email: `mailto:${profile.email}`,
  description,
  address: { "@type": "PostalAddress", addressLocality: "Lagos", addressCountry: "NG" },
  worksFor: [
    { "@type": "Organization", name: "Lumenware Technologies", description: "Founder" },
    { "@type": "Organization", name: "NOLT Finance", description: "Fintech Engineer" },
  ],
  knowsAbout: ["Full-stack engineering", "SaaS", "Fintech", "AI systems", "NestJS", "Next.js", "PostgreSQL", "Loan verification", "WhatsApp automation"],
  sameAs: [profile.github, profile.linkedin, profile.x],
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

// Marks the page as script-enabled before first paint, so scroll reveals can start hidden without a flash.
// With scripts off, nothing is hidden.
const jsFlag = `document.documentElement.classList.add("js")`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: person }} />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
