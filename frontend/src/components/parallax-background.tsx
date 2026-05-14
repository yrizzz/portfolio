"use client";

import { useRef, useEffect } from "react";

// Global start time - persists across re-mounts
let orbitStartTime: number | null = null;
if (typeof window !== "undefined" && orbitStartTime === null) {
  orbitStartTime = Date.now();
}

export function ParallaxBackground() {
  const shootingStarsRef = useRef<HTMLDivElement>(null);
  const moonRef = useRef<HTMLDivElement>(null);

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

      // CSS animation
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

  // Moon orbit (dark mode)
  useEffect(() => {
    const moon = moonRef.current;
    if (!moon) return;

    const duration = 90;
    let animFrame: number;

    const animate = () => {
      const elapsed = (Date.now() - (orbitStartTime || Date.now())) / 1000;
      const t = (elapsed % duration) / duration;
      const angle = t * Math.PI * 2;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const radiusX = window.innerWidth * 0.45;
      const radiusY = window.innerHeight * 0.45;

      const x = centerX + Math.cos(angle) * radiusX - 30;
      const y = centerY + Math.sin(angle) * radiusY - 30;

      const heightFactor = 1 - (y / window.innerHeight);
      const opacity = Math.max(0, Math.min(1, heightFactor * 1.5));
      const scale = 0.85 + heightFactor * 0.3;

      moon.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      moon.style.opacity = String(opacity);

      animFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animFrame);
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')]" />
      </div>

      {/* Shooting stars - above everything */}
      <div ref={shootingStarsRef} className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden" />

      {/* Moon - dark mode */}
      <div ref={moonRef} className="fixed top-0 left-0 z-[-1] pointer-events-none opacity-0 hidden dark:block" style={{ width: '60px', height: '60px' }}>
        <div className="relative w-full h-full">
          <div className="absolute -inset-[150px] rounded-full blur-2xl" 
               style={{ background: 'radial-gradient(circle, rgba(180,200,240,0.18) 0%, rgba(140,170,220,0.08) 30%, rgba(100,140,200,0.03) 50%, transparent 70%)' }} />
          <div className="absolute -inset-[60px] rounded-full blur-xl"
               style={{ background: 'radial-gradient(circle, rgba(200,215,245,0.3) 0%, rgba(160,185,230,0.12) 40%, transparent 70%)' }} />
          <div className="absolute -inset-[20px] rounded-full blur-md"
               style={{ background: 'radial-gradient(circle, rgba(220,230,255,0.45) 0%, rgba(180,200,240,0.2) 50%, transparent 75%)' }} />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 shadow-[0_0_15px_5px_rgba(200,215,240,0.5),0_0_40px_15px_rgba(160,185,230,0.25),0_0_80px_30px_rgba(120,150,210,0.1)]" />
          <div className="absolute top-[20%] left-[25%] w-[18%] h-[18%] rounded-full bg-gray-300/50" />
          <div className="absolute top-[45%] left-[55%] w-[22%] h-[22%] rounded-full bg-gray-300/40" />
          <div className="absolute top-[65%] left-[30%] w-[14%] h-[14%] rounded-full bg-gray-300/30" />
          <div className="absolute top-[30%] left-[60%] w-[10%] h-[10%] rounded-full bg-gray-300/40" />
          <div className="absolute inset-0 rounded-full shadow-[inset_-8px_-4px_12px_rgba(0,0,0,0.2)]" />
        </div>
      </div>
    </>
  );
}
