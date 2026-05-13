"use client";

import { useEffect, useRef } from "react";

export function CursorEffect() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorOutlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorOutline = cursorOutlineRef.current;
    if (!cursor || !cursorOutline) return;

    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Update cursor dot immediately
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    };

    // Smooth follow animation for outline
    const animate = () => {
      const dx = mouseX - outlineX;
      const dy = mouseY - outlineY;
      
      outlineX += dx * 0.15;
      outlineY += dy * 0.15;
      
      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;
      
      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* Outline ring */}
      <div
        ref={cursorOutlineRef}
        className="fixed pointer-events-none z-[9999] hidden lg:block"
        style={{
          width: "32px",
          height: "32px",
          border: "1px solid rgba(59, 130, 246, 0.4)",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          transition: "width 0.2s ease, height 0.2s ease",
        }}
      />
      {/* Center dot */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[9999] hidden lg:block"
        style={{
          width: "6px",
          height: "6px",
          backgroundColor: "rgba(59, 130, 246, 0.8)",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </>
  );
}
