import { PortfolioLayout } from "@/components/portfolio-layout";
import { HeroSection } from "@/components/hero-section";
import { ProjectsSection } from "@/components/projects-section";
import { AboutSection } from "@/components/about-section";
import { ExperienceSection } from "@/components/experience-section";
import { ContactSection } from "@/components/contact-section";
import { CursorEffect } from "@/components/cursor-effect";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SpaceBackground } from "@/components/space-background";

export default function Home() {
  return (
    <>
      <SpaceBackground />
      <SmoothScroll />
      <CursorEffect />
      <PortfolioLayout>
        <div className="p-4 md:p-6">
          <div className="space-y-6">
            <div id="home">
              <HeroSection />
            </div>
            <div id="projects" className="pt-12 md:pt-16 lg:pt-20">
              <ProjectsSection />
            </div>
            <div id="about">
              <AboutSection />
            </div>
            <div id="experience">
              <ExperienceSection />
            </div>
            <div id="contact">
              <ContactSection />
            </div>
          </div>
        </div>
      </PortfolioLayout>
    </>
  );
}
