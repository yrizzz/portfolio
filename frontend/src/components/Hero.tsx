"use client";

/**
 * Hero Section - Fullstack Web Developer Portfolio
 * Features: GSAP animations, magnetic buttons, parallax, split text reveal
 */

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowDown, Mail, MapPin } from "lucide-react";
import {
  useGSAP,
  splitTextReveal,
  magneticButton,
  parallaxEffect,
  pulseAnimation,
  glowOnHover,
} from "@/lib/gsap-utils";
import gsap from "gsap";

// SVG Icons
const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

export function Hero() {
  // Refs for GSAP animations
  const containerRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaPrimaryRef = useRef<HTMLButtonElement>(null);
  const ctaSecondaryRef = useRef<HTMLButtonElement>(null);
  const scrollArrowRef = useRef<HTMLDivElement>(null);
  const floatingCardsRef = useRef<HTMLDivElement>(null);

  // Main GSAP animations
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // 1. Avatar entrance - scale + rotate
    tl.from(avatarRef.current, {
      scale: 0,
      rotation: -180,
      duration: 1.2,
      ease: "back.out(1.7)",
    });

    // 2. Split text reveal for title
    if (titleRef.current) {
      splitTextReveal(titleRef.current, {
        duration: 0.8,
        stagger: 0.05,
        delay: 0.3,
      });
    }

    // 3. Subtitle fade + slide
    tl.from(
      subtitleRef.current,
      {
        y: 30,
        opacity: 0,
        duration: 0.8,
      },
      "-=0.4"
    );

    // 4. CTA buttons stagger
    tl.from(
      [ctaPrimaryRef.current, ctaSecondaryRef.current],
      {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
      },
      "-=0.3"
    );

    // 5. Floating cards parallax
    if (floatingCardsRef.current) {
      parallaxEffect(floatingCardsRef.current, 0.5);
    }

    // 6. Scroll arrow pulse
    if (scrollArrowRef.current) {
      pulseAnimation(scrollArrowRef.current);
    }
  }, []);

  // Magnetic button effects
  useEffect(() => {
    if (ctaPrimaryRef.current) {
      magneticButton(ctaPrimaryRef.current, 0.3);
      glowOnHover(ctaPrimaryRef.current);
    }
    if (ctaSecondaryRef.current) {
      magneticButton(ctaSecondaryRef.current, 0.2);
    }
    if (avatarRef.current) {
      magneticButton(avatarRef.current, 0.4);
    }
  }, []);

  const scrollToProjects = () => {
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-black dark:to-zinc-900" />
      
      {/* Animated Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Floating Cards Background */}
      <div ref={floatingCardsRef} className="absolute inset-0 pointer-events-none">
        <Card className="absolute top-20 left-10 w-32 h-32 bg-blue-500/5 backdrop-blur-sm border-blue-500/20 rotate-12" />
        <Card className="absolute bottom-32 right-20 w-40 h-40 bg-purple-500/5 backdrop-blur-sm border-purple-500/20 -rotate-6" />
        <Card className="absolute top-1/3 right-10 w-24 h-24 bg-pink-500/5 backdrop-blur-sm border-pink-500/20 rotate-45" />
      </div>

      {/* Main Content */}
      <div className="container relative z-10 px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          
          {/* Left: Avatar */}
          <div className="flex justify-center lg:justify-end order-1 lg:order-1">
            <div ref={avatarRef} className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 blur-2xl group-hover:opacity-30 transition-opacity" />
              
              <Avatar className="w-64 h-64 border-4 border-white dark:border-zinc-800 shadow-2xl relative">
                <AvatarImage src="" alt="Ahmad Fauzi" />
                <AvatarFallback className="text-6xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                  AF
                </AvatarFallback>
              </Avatar>

              {/* Floating badge */}
              <Badge className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white shadow-lg">
                Available for Hire
              </Badge>
            </div>
          </div>

          {/* Right: Content */}
          <div className="text-center lg:text-left order-2 lg:order-2 space-y-6">
            {/* Name */}
            <div>
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2 justify-center lg:justify-start">
                <MapPin className="w-4 h-4" />
                Surakarta, Indonesia
              </p>
              <h1
                ref={titleRef}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
              >
                Ahmad Fauzi
              </h1>
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Fullstack Web Developer
            </h2>

            {/* Description */}
            <p
              ref={subtitleRef}
              className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0"
            >
              Building scalable web applications with modern technologies.
              Specialized in React, Next.js, Node.js, and MongoDB.
            </p>

            {/* Tech Stack Badges */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              <Badge variant="secondary">React</Badge>
              <Badge variant="secondary">Next.js</Badge>
              <Badge variant="secondary">Node.js</Badge>
              <Badge variant="secondary">Express</Badge>
              <Badge variant="secondary">MongoDB</Badge>
              <Badge variant="secondary">Tailwind CSS</Badge>
              <Badge variant="secondary">shadcn/ui</Badge>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button
                ref={ctaPrimaryRef}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25"
                onClick={scrollToProjects}
              >
                View Projects
              </Button>
              <Button
                ref={ctaSecondaryRef}
                size="lg"
                variant="outline"
                className="border-2"
              >
                <a href="/cv.pdf" download className="flex items-center gap-2">
                  Download CV
                </a>
              </Button>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 justify-center lg:justify-start pt-4">
              <a
                href="https://github.com/ahmadfauzi"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <GithubIcon />
                <span className="hidden sm:inline">GitHub</span>
              </a>
              <a
                href="https://linkedin.com/in/ahmadfauzi"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LinkedinIcon />
                <span className="hidden sm:inline">LinkedIn</span>
              </a>
              <a
                href="mailto:ahmad@example.com"
                className="social-link inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span className="hidden sm:inline">Email</span>
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Down Arrow */}
        <div
          ref={scrollArrowRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
          onClick={scrollToProjects}
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <span className="text-sm">Scroll Down</span>
            <ArrowDown className="w-6 h-6 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
