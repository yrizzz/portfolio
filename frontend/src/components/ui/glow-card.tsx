"use client";

import React from "react";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
}

export function GlowCard({ children, className = "", hoverScale = 1.02 }: GlowCardProps) {
  return (
    <div
      className={`relative rounded-xl bg-card border border-border transition-all duration-500 ease-out hover:-translate-y-1 ${className}`}
      style={{ 
        transform: `scale(1)`,
        willChange: "transform, box-shadow",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 20px 40px -12px rgba(59, 130, 246, 0.25), 0 10px 20px -8px rgba(19, 107, 254, 0.2), 0 4px 8px -4px rgba(13, 71, 196, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
      }}
    >
      {children}
    </div>
  );
}
