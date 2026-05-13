"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      container.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
  }, { scope: container, dependencies: [pathname] });

  return (
    <div ref={container} key={pathname}>
      {children}
    </div>
  );
}

export const FadeTransition = PageTransition;
export const SlideTransition = PageTransition;
export const ScaleTransition = PageTransition;
export const CurtainTransition = PageTransition;
