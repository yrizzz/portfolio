"use client";

import { useRef, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { AnimatedButton, AnimatedIconButton } from "@/components/ui/animated-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Download, MapPin, ChevronDown } from "lucide-react";
import { FadeInOnScroll, SlideInLeft, SlideInRight } from "@/components/scroll-animations";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

// Icon SVG paths
const iconPaths: Record<string, string> = {
  github: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
  linkedin: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
  twitter: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  facebook: "M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z",
  youtube: "M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z",
  dribbble: "M12 0c-6.628 0-12 5.373-12 12s5.372 12 12 12 12-5.373 12-12-5.372-12-12-12zm9.885 11.441c-2.575-.422-4.943-.445-7.103-.073-.244-.563-.497-1.125-.767-1.68 2.31-1 4.165-2.358 5.548-4.082 1.35 1.594 2.197 3.619 2.322 5.835zm-3.842-7.282c-1.205 1.554-2.868 2.783-4.986 3.68-1.016-1.861-2.178-3.676-3.488-5.438.779-.197 1.591-.314 2.431-.314 2.275 0 4.368.779 6.043 2.072zm-10.516-.993c1.331 1.742 2.511 3.538 3.537 5.381-2.43.715-5.331 1.082-8.684 1.105.692-2.835 2.601-5.193 5.147-6.486zm-5.44 8.834l.013-.256c3.849-.005 7.169-.448 9.95-1.322.233.475.456.952.67 1.432-3.38 1.057-6.165 3.222-8.337 6.48-1.432-1.719-2.296-3.927-2.296-6.334zm3.829 7.81c1.969-3.088 4.482-5.098 7.598-6.027.928 2.42 1.609 4.91 2.043 7.46-3.349 1.291-7.21.873-9.641-1.433zm11.586.43c-.438-2.353-1.08-4.653-1.92-6.897 1.876-.265 3.94-.196 6.199.196-.437 2.786-2.028 5.192-4.279 6.701z",
  behance: "M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z"
};

export function HeroSection() {
  const bgRef = useRef<HTMLDivElement>(null);
  const [profileData, setProfileData] = useState({
    name: "YrizzzDev",
    title: "Full Stack Developer",
    subtitle: "Full-Stack Web Specialist 🚀",
    location: "Indonesia",
    bio1: "With over 5 years of professional experience, I specialize in crafting robust and scalable web applications. My expertise lies in building modern, high-performance solutions using Laravel and Livewire.",
    bio2: "From concept to deployment, I deliver end-to-end solutions that combine elegant code architecture with exceptional user experiences.",
    avatarUrl: "",
    status: "Available to be partner",
    cvUrl: "",
    socialLinks: [
      { id: "1", url: "https://github.com/yrizzz", icon: "github" },
      { id: "2", url: "https://linkedin.com", icon: "linkedin" }
    ]
  });

  // Load profile data
  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        // Handle both old and new response format
        if (data.success && data.profile) {
          setProfileData(data.profile);
        } else if (data.name) {
          // Old format (direct data)
          setProfileData(data);
        }
      })
      .catch(err => console.error('Failed to load profile:', err));
  }, []);

  // Animate the mesh gradient blobs subtly
  useGSAP(() => {
    const blobs = gsap.utils.toArray<HTMLElement>(".hero-blob");
    blobs.forEach((blob, i) => {
      gsap.to(blob, {
        x: `random(-60, 60)`,
        y: `random(-60, 60)`,
        scale: `random(0.8, 1.2)`,
        duration: `random(8, 14)`,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.5,
      });
    });
  }, { scope: bgRef });

  const scrollToProjects = () => {
    const el = document.querySelector("#projects");
    if (el) {
      const offset = 80;
      const pos = el.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: pos, behavior: "smooth" });
    }
  };

  return (
    <section className="relative flex items-center justify-center py-8 lg:py-0 lg:h-[calc(100vh-3.5rem)]">
      <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto w-full lg:-mt-24 px-4 sm:px-6 lg:px-8">
        {/* Free Palestine Banner */}
        <div className="mb-4 lg:mb-8 flex justify-center animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-full bg-background/20 dark:bg-background/15 backdrop-blur-md shadow-[0_8px_32px_0_rgba(13,71,196,0.15)] dark:shadow-[0_8px_32px_0_rgba(59,130,246,0.2)] border border-white/10 dark:border-white/5 hover:scale-105 transition-transform duration-300">
            <span className="text-sm md:text-base font-bold">
              🇵🇸 Free Palestine
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 2xl:gap-16 items-center">
          {/* LEFT: Photo, Name, Socials */}
          <div className="flex flex-col items-center gap-4 lg:gap-6 text-center lg:col-span-5">
            {/* Avatar */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#0d47c4] via-[#3b82f6] to-[#136bfe] rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              <Avatar className="relative h-32 w-32 md:h-40 md:w-40 lg:h-44 lg:w-44 2xl:h-52 2xl:w-52 border-4 border-white/20 dark:border-white/10 shadow-2xl backdrop-blur-sm">
                <AvatarImage src={profileData.avatarUrl} alt={profileData.name} />
                <AvatarFallback className="text-xl lg:text-2xl 2xl:text-4xl font-bold bg-gradient-to-br from-[#0d47c4] to-[#3b82f6] text-white">
                  {profileData.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-1 lg:space-y-1.5">
              <h1 className="text-3xl md:text-4xl lg:text-5xl 2xl:text-6xl font-bold bg-gradient-to-r from-[#0d47c4] via-[#3b82f6] to-[#136bfe] bg-clip-text text-transparent">
                {profileData.name}
              </h1>
              <p className="text-sm md:text-base lg:text-lg 2xl:text-xl font-medium text-muted-foreground">
                {profileData.title}
              </p>
            </div>

            {/* Location & Status */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{profileData.location}</span>
              </div>
              <Badge 
                variant="secondary" 
                className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 hover:bg-green-500/20 px-4 py-1.5 backdrop-blur-sm"
              >
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                {profileData.status}
              </Badge>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {profileData.socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                >
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#0d47c4] to-[#3b82f6] rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                  <div className="relative h-10 w-10 lg:h-12 lg:w-12 rounded-lg bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-sm border border-white/20 dark:border-white/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg">
                    <svg className="h-5 w-5 lg:h-6 lg:w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d={iconPaths[link.icon]} />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT: Bio & Actions */}
          <div className="flex flex-col gap-4 lg:gap-6 text-center lg:text-left lg:col-span-7">
            <div className="space-y-3 lg:space-y-4">
              <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold">
                {profileData.subtitle}
              </h2>
              <div className="space-y-2 lg:space-y-3">
                <p className="text-sm 2xl:text-base text-muted-foreground leading-relaxed text-justify">
                  {profileData.bio1}
                </p>
                <p className="text-sm 2xl:text-base text-muted-foreground leading-relaxed text-justify">
                  {profileData.bio2}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <AnimatedButton
                size="lg"
                className="gap-2 font-semibold shadow-lg shadow-primary/20 rounded-xl px-6 backdrop-blur-sm"
                hoverScale={1.05}
                tapScale={0.95}
                onClick={() => {
                  const contactSection = document.querySelector("#contact");
                  if (contactSection) {
                    const offset = 80;
                    const pos = contactSection.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({ top: pos, behavior: "smooth" });
                  }
                }}
              >
                <Mail className="h-4 w-4" />
                Contact Me
              </AnimatedButton>
              {profileData.cvUrl && (
                <AnimatedButton
                  size="lg"
                  variant="outline"
                  className="gap-2 border-2 rounded-xl px-6 backdrop-blur-sm bg-white/5 hover:bg-white/10 shadow-lg"
                  hoverScale={1.05}
                  tapScale={0.95}
                  onClick={() => window.open(profileData.cvUrl, '_blank')}
                >
                  <Download className="h-4 w-4" />
                  Download CV
                </AnimatedButton>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <button
        onClick={scrollToProjects}
        className="hidden lg:flex absolute bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer group animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700"
        aria-label="Scroll to projects"
      >
        <span className="text-xs font-medium tracking-wider uppercase">Scroll Down</span>
        <div className="relative">
          <ChevronDown className="h-6 w-6 animate-bounce" />
          <ChevronDown className="h-6 w-6 absolute top-0 left-0 animate-bounce opacity-50" style={{ animationDelay: '0.2s' }} />
        </div>
      </button>
    </section>
  );
}
