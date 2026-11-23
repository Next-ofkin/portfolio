import type { Metadata, Viewport } from "next";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@fontsource-variable/inter";
import "./globals.css";
import { profile, siteUrl } from "@/lib/content";

const title = `${profile.name} | ${profile.title}`;
const description = profile.subtitle;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s | ${profile.name}` },
  description,
  openGraph: { type: "website", url: siteUrl, siteName: profile.name, title, description },
  twitter: { card: "summary_large_image", title, description },
};

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
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
