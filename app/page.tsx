import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { CursorGlow } from "@/components/CursorGlow";
import { Experience } from "@/components/Experience";
import { Footer } from "@/components/Footer";
import { GithubSection } from "@/components/GithubSection";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Lab } from "@/components/Lab";
import { NowBuilding } from "@/components/NowBuilding";
import { Skills } from "@/components/Skills";
import { Work } from "@/components/Work";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-accent-strong focus:px-5 focus:py-2.5 focus:text-white"
      >
        Skip to main content
      </a>
      <CursorGlow />
      <div aria-hidden="true" className="grain" />
      <Header />
      <main id="main" className="relative z-10 mx-auto max-w-7xl px-5 md:px-10">
        <Hero />
        <NowBuilding />
        <About />
        <Work />
        <GithubSection />
        <Lab />
        <Skills />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
