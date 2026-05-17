"use client";

import { useRef, useEffect } from "react";

export function ParallaxBackground() {
  const shootingStarsRef = useRef<HTMLDivElement>(null);
  const twinklingStarsRef = useRef<HTMLDivElement>(null);

  // Shooting stars effect
  useEffect(() => {
    const container = shootingStarsRef.current;
    if (!container) return;

    const createShootingStar = () => {
      const star = document.createElement('div');
      star.className = 'shooting-star';
      
      const direction = Math.random() > 0.5 ? 1 : -1;
      let startX, startY;
      if (direction === 1) {
        startX = Math.random() * 30;
        startY = Math.random() * 40;
      } else {
        startX = 70 + Math.random() * 30;
        startY = Math.random() * 40;
      }
      
      const baseAngle = direction === 1 ? 45 : 135;
      const angleVariation = (Math.random() - 0.5) * 20;
      const angle = baseAngle + angleVariation;
      const distance = Math.random() * 300 + 400;
      const duration = Math.random() * 0.8 + 1.2;
      
      star.style.left = `${startX}%`;
      star.style.top = `${startY}%`;
      star.style.setProperty('--angle', `${angle}deg`);
      
      container.appendChild(star);

      const endX = Math.cos(angle * Math.PI / 180) * distance;
      const endY = Math.sin(angle * Math.PI / 180) * distance;

      star.animate([
        { transform: 'translate(0, 0)', opacity: 1 },
        { transform: `translate(${endX}px, ${endY}px)`, opacity: 0 }
      ], {
        duration: duration * 1000,
        easing: 'ease-in',
        fill: 'forwards'
      }).onfinish = () => star.remove();
    };

    const createStarWithDelay = () => {
      createShootingStar();
      const nextDelay = Math.random() * 4000 + 2000;
      const timeout = setTimeout(() => {
        if (container) createStarWithDelay();
      }, nextDelay);
      return timeout;
    };

    const timeout = createStarWithDelay();

    const burstInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const burstCount = Math.floor(Math.random() * 2) + 2;
        for (let i = 0; i < burstCount; i++) {
          setTimeout(() => createShootingStar(), i * 300);
        }
      }
    }, 8000);

    return () => {
      clearTimeout(timeout);
      clearInterval(burstInterval);
    };
  }, []);

  // Twinkling stars effect (lightweight CSS-only animations)
  useEffect(() => {
    const container = twinklingStarsRef.current;
    if (!container) return;

    // We only generate 70 stars to keep it very lightweight
    const starCount = 70;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      const size = Math.random() * 1.5 + 1; // 1px to 2.5px
      
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.position = 'absolute';
      star.style.backgroundColor = '#e2e8f0'; // slate-200
      star.style.borderRadius = '50%';
      star.style.opacity = '0'; // Start invisible
      
      const duration = Math.random() * 3 + 2; // 2s to 5s
      const delay = Math.random() * 5; // 0s to 5s
      
      star.style.animation = `twinkle ${duration}s infinite ease-in-out ${delay}s`;
      fragment.appendChild(star);
    }

    container.appendChild(fragment);

    return () => {
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes twinkle {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.8; transform: scale(1.2); box-shadow: 0 0 5px 1px rgba(255,255,255,0.4); }
          100% { opacity: 0; transform: scale(0.5); }
        }
      `}} />
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')]" />
      </div>

      {/* Twinkling stars - dark mode only */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden hidden dark:block">
        <div ref={twinklingStarsRef} className="absolute inset-0" />
      </div>

      {/* Shooting stars - above everything */}
      <div ref={shootingStarsRef} className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden" />
    </>
  );
}
