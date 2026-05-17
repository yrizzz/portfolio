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
        <div className="p-4 md:p-6 overflow-x-hidden">
          <div className="space-y-6 max-w-full">
            <div id="home">
              <HeroSection />
            </div>
            <div id="projects" className="pt-8 md:pt-10 lg:pt-10" data-aos="fade-up">
              <ProjectsSection />
            </div>
            <div id="about" data-aos="fade-up">
              <AboutSection />
            </div>
            <div id="experience" data-aos="fade-up">
              <ExperienceSection />
            </div>
            <div id="contact" data-aos="fade-up">
              <ContactSection />
            </div>
          </div>
        </div>
      </PortfolioLayout>
    </>
  );
}
