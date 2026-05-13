"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FadeInOnScroll({ children, delay = 0, className = "" }: FadeInProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(container.current, 
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: delay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: container.current,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      }
    );
  }, { scope: container });

  return (
    <div ref={container} className={`will-change-transform opacity-0 ${className}`}>
      {children}
    </div>
  );
}

export function SlideInLeft({ children, delay = 0, className = "" }: FadeInProps) {
  const container = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.fromTo(container.current, 
      { opacity: 0, x: -50 }, 
      { opacity: 1, x: 0, duration: 0.8, delay, ease: "power2.out", scrollTrigger: { trigger: container.current, start: "top 85%" } }
    );
  }, { scope: container });
  return <div ref={container} className={`will-change-transform opacity-0 ${className}`}>{children}</div>;
}

export function SlideInRight({ children, delay = 0, className = "" }: FadeInProps) {
  const container = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.fromTo(container.current, 
      { opacity: 0, x: 50 }, 
      { opacity: 1, x: 0, duration: 0.8, delay, ease: "power2.out", scrollTrigger: { trigger: container.current, start: "top 85%" } }
    );
  }, { scope: container });
  return <div ref={container} className={`will-change-transform opacity-0 ${className}`}>{children}</div>;
}

export function SlideInUp({ children, delay = 0, className = "" }: FadeInProps) {
  const container = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.fromTo(container.current, 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 0.8, delay, ease: "power2.out", scrollTrigger: { trigger: container.current, start: "top 85%" } }
    );
  }, { scope: container });
  return <div ref={container} className={`will-change-transform opacity-0 ${className}`}>{children}</div>;
}

export function StaggerContainer({ children, className = "" }: FadeInProps) {
  const container = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.fromTo(container.current!.querySelectorAll('.stagger-item'), 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: container.current, start: "top 85%" } }
    );
  }, { scope: container });
  return <div ref={container} className={className}>{children}</div>;
}

export function StaggerItem({ children, className = "" }: FadeInProps) {
  return <div className={`stagger-item opacity-0 will-change-transform ${className}`}>{children}</div>;
}
