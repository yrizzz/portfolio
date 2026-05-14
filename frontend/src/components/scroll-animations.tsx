"use client";

import React from "react";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FadeInOnScroll({ children, delay = 0, className = "" }: FadeInProps) {
  return (
    <div data-aos="fade-up" data-aos-delay={delay * 1000} className={className}>
      {children}
    </div>
  );
}

export function SlideInLeft({ children, delay = 0, className = "" }: FadeInProps) {
  return (
    <div data-aos="fade-right" data-aos-delay={delay * 1000} className={className}>
      {children}
    </div>
  );
}

export function SlideInRight({ children, delay = 0, className = "" }: FadeInProps) {
  return (
    <div data-aos="fade-left" data-aos-delay={delay * 1000} className={className}>
      {children}
    </div>
  );
}

export function SlideInUp({ children, delay = 0, className = "" }: FadeInProps) {
  return (
    <div data-aos="fade-up" data-aos-delay={delay * 1000} className={className}>
      {children}
    </div>
  );
}

export function StaggerContainer({ children, className = "" }: FadeInProps) {
  return <div className={className}>{children}</div>;
}

export function StaggerItem({ children, className = "" }: FadeInProps & { index?: number }) {
  return (
    <div data-aos="fade-up" data-aos-delay={100} className={className}>
      {children}
    </div>
  );
}
