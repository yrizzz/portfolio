"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export function ParallaxBackground() {
  const container = useRef<HTMLDivElement>(null);
  const shootingStarsRef = useRef<HTMLDivElement>(null);

  const orbs = [
    { size: 300, x: "10%", y: "5%", color: "oklch(0.6 0.2 265 / 8%)", speed: 0.8 },
    { size: 200, x: "80%", y: "15%", color: "oklch(0.55 0.22 300 / 6%)", speed: 0.4 },
    { size: 350, x: "60%", y: "40%", color: "oklch(0.6 0.18 340 / 5%)", speed: 1.2 },
    { size: 250, x: "20%", y: "60%", color: "oklch(0.65 0.2 265 / 7%)", speed: 0.8 },
    { size: 180, x: "75%", y: "70%", color: "oklch(0.5 0.25 300 / 6%)", speed: 0.4 },
    { size: 280, x: "40%", y: "85%", color: "oklch(0.6 0.2 340 / 5%)", speed: 1.2 },
    { size: 150, x: "90%", y: "50%", color: "oklch(0.65 0.15 265 / 8%)", speed: 0.8 },
    { size: 220, x: "5%", y: "35%", color: "oklch(0.55 0.2 300 / 6%)", speed: 0.4 },
  ];

  useGSAP(() => {
    const orbElements = gsap.utils.toArray<HTMLElement>('.parallax-orb');
    
    orbElements.forEach((orb, i) => {
      const speed = orbs[i].speed;
      gsap.to(orb, {
        y: -300 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom top",
          scrub: true,
        }
      });
    });
  }, { scope: container });

  // Shooting stars effect
  useEffect(() => {
    const shootingStarsContainer = shootingStarsRef.current;
    if (!shootingStarsContainer) return;

    const createShootingStar = () => {
      const star = document.createElement('div');
      star.className = 'shooting-star';
      
      // Random direction: top-left to bottom-right OR top-right to bottom-left
      const direction = Math.random() > 0.5 ? 1 : -1;
      
      // Starting position based on direction
      let startX, startY;
      if (direction === 1) {
        // Top-left to bottom-right
        startX = Math.random() * 30; // Left side
        startY = Math.random() * 40; // Top area
      } else {
        // Top-right to bottom-left
        startX = 70 + Math.random() * 30; // Right side
        startY = Math.random() * 40; // Top area
      }
      
      // Random angle based on direction
      const baseAngle = direction === 1 ? 45 : 135; // 45° or 135°
      const angleVariation = (Math.random() - 0.5) * 20; // ±10° variation
      const angle = baseAngle + angleVariation;
      
      const distance = Math.random() * 300 + 400; // 400-700px
      const duration = Math.random() * 0.8 + 1.2; // 1.2-2s for smooth motion
      
      star.style.left = `${startX}%`;
      star.style.top = `${startY}%`;
      star.style.setProperty('--angle', `${angle}deg`);
      
      shootingStarsContainer.appendChild(star);

      // Calculate end position
      const endX = Math.cos(angle * Math.PI / 180) * distance;
      const endY = Math.sin(angle * Math.PI / 180) * distance;

      // Smooth animation with GSAP
      const tl = gsap.timeline({
        onComplete: () => star.remove()
      });

      // Single smooth animation with progressive fade
      tl.to(star, {
        x: endX,
        y: endY,
        opacity: 0,
        duration: duration,
        ease: "power1.in", // Accelerate as it falls and fades
      });
    };

    // Create stars with varied intervals for smooth, natural appearance
    const createStarWithDelay = () => {
      createShootingStar();
      
      // Random delay for next star (2-6 seconds)
      const nextDelay = Math.random() * 4000 + 2000;
      
      setTimeout(() => {
        if (shootingStarsContainer) {
          createStarWithDelay();
        }
      }, nextDelay);
    };

    // Start the chain
    createStarWithDelay();
    
    // Occasionally create bursts of multiple stars
    const burstInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        // Create 2-3 stars in quick succession
        const burstCount = Math.floor(Math.random() * 2) + 2;
        for (let i = 0; i < burstCount; i++) {
          setTimeout(() => createShootingStar(), i * 300);
        }
      }
    }, 8000); // Check every 8 seconds

    return () => {
      clearInterval(burstInterval);
    };
  }, []);

  return (
    <div ref={container} className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-background">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Aurora effect */}
      <div className="aurora-container">
        <div className="aurora aurora-1"></div>
        <div className="aurora aurora-2"></div>
        <div className="aurora aurora-3"></div>
      </div>

      {orbs.map((orb, i) => (
        <div
          key={i}
          className="parallax-orb absolute rounded-full blur-3xl will-change-transform"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: orb.color,
          }}
        />
      ))}

      {/* Shooting stars container */}
      <div ref={shootingStarsRef} className="absolute inset-0" />

      <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')]" />
    </div>
  );
}
