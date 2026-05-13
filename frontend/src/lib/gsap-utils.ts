/**
 * GSAP Utilities & Custom Hooks
 * Setup GSAP with ScrollTrigger and custom animation helpers
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * useGSAP Hook - Context-safe GSAP animations
 * Auto cleanup on unmount
 */
export function useGSAP(
  callback: (context: gsap.Context) => void,
  dependencies: any[] = []
) {
  const ctx = useRef<gsap.Context | null>(null);

  useLayoutEffect(() => {
    ctx.current = gsap.context(() => {
      callback(ctx.current!);
    });

    return () => ctx.current?.revert();
  }, dependencies);

  return ctx;
}

/**
 * Split Text Animation
 * Reveal text character by character with stagger
 */
export function splitTextReveal(
  element: HTMLElement | null,
  options?: {
    duration?: number;
    stagger?: number;
    delay?: number;
  }
) {
  if (!element) return;

  const { duration = 0.8, stagger = 0.03, delay = 0 } = options || {};

  // Split text into characters
  const text = element.textContent || "";
  element.innerHTML = text
    .split("")
    .map((char) => `<span class="inline-block">${char === " " ? "&nbsp;" : char}</span>`)
    .join("");

  // Animate characters
  gsap.from(element.children, {
    opacity: 0,
    y: 20,
    rotateX: -90,
    stagger,
    duration,
    delay,
    ease: "back.out(1.7)",
  });
}

/**
 * Magnetic Button Effect
 * Button follows cursor on hover
 */
export function magneticButton(button: HTMLElement | null, strength = 0.3) {
  if (!button) return;

  const handleMouseMove = (e: MouseEvent) => {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(button, {
      x: x * strength,
      y: y * strength,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(button, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.3)",
    });
  };

  button.addEventListener("mousemove", handleMouseMove);
  button.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    button.removeEventListener("mousemove", handleMouseMove);
    button.removeEventListener("mouseleave", handleMouseLeave);
  };
}

/**
 * Parallax Effect
 * Element moves at different speed on scroll
 */
export function parallaxEffect(
  element: HTMLElement | null,
  speed = 0.5,
  direction: "up" | "down" = "up"
) {
  if (!element) return;

  gsap.to(element, {
    scrollTrigger: {
      trigger: element,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
    y: direction === "up" ? -100 * speed : 100 * speed,
    ease: "none",
  });
}

/**
 * Fade In On Scroll
 * Element fades in when scrolled into view
 */
export function fadeInOnScroll(
  element: HTMLElement | null,
  options?: {
    direction?: "up" | "down" | "left" | "right";
    distance?: number;
    duration?: number;
  }
) {
  if (!element) return;

  const { direction = "up", distance = 60, duration = 0.8 } = options || {};

  const fromVars: any = {
    opacity: 0,
    duration,
    ease: "power3.out",
  };

  switch (direction) {
    case "up":
      fromVars.y = distance;
      break;
    case "down":
      fromVars.y = -distance;
      break;
    case "left":
      fromVars.x = distance;
      break;
    case "right":
      fromVars.x = -distance;
      break;
  }

  gsap.from(element, {
    scrollTrigger: {
      trigger: element,
      start: "top 80%",
      toggleActions: "play none none none",
    },
    ...fromVars,
  });
}

/**
 * Stagger Animation
 * Animate multiple elements with delay
 */
export function staggerAnimation(
  elements: HTMLElement[] | NodeListOf<Element>,
  options?: {
    direction?: "up" | "down" | "left" | "right";
    stagger?: number;
    duration?: number;
  }
) {
  if (!elements || elements.length === 0) return;

  const { direction = "up", stagger = 0.1, duration = 0.6 } = options || {};

  const fromVars: any = {
    opacity: 0,
    duration,
    stagger,
    ease: "power3.out",
  };

  switch (direction) {
    case "up":
      fromVars.y = 40;
      break;
    case "down":
      fromVars.y = -40;
      break;
    case "left":
      fromVars.x = 40;
      break;
    case "right":
      fromVars.x = -40;
      break;
  }

  gsap.from(elements, {
    scrollTrigger: {
      trigger: elements[0],
      start: "top 80%",
    },
    ...fromVars,
  });
}

/**
 * Pulse Animation
 * Continuous pulse effect
 */
export function pulseAnimation(element: HTMLElement | null, scale = 1.1) {
  if (!element) return;

  gsap.to(element, {
    scale,
    duration: 1.5,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
  });
}

/**
 * Glow Effect on Hover
 * Add glow shadow on hover
 */
export function glowOnHover(element: HTMLElement | null) {
  if (!element) return;

  const handleMouseEnter = () => {
    gsap.to(element, {
      boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)",
      scale: 1.05,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(element, {
      boxShadow: "0 0 0px rgba(59, 130, 246, 0)",
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  element.addEventListener("mouseenter", handleMouseEnter);
  element.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    element.removeEventListener("mouseenter", handleMouseEnter);
    element.removeEventListener("mouseleave", handleMouseLeave);
  };
}
