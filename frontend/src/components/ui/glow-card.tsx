"use client";

import React from "react";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  onClick?: () => void;
}

export function GlowCard({ children, className = "", hoverScale = 1.02, onClick }: GlowCardProps) {
  return (
    <div
      className={`relative rounded-xl bg-white/80 dark:bg-background/20 backdrop-blur-xl border border-gray-200/60 dark:border-white/10 transition-all duration-500 ease-out hover:-translate-y-1 ${className}`}
      style={{ 
        transform: `scale(1)`,
        willChange: "transform, box-shadow",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)"
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 20px 40px -12px rgba(59, 130, 246, 0.15), 0 10px 20px -8px rgba(19, 107, 254, 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)";
      }}
    >
      {children}
    </div>
  );
}
