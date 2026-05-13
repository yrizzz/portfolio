"use client";

import React, { useEffect, useRef } from 'react';
import { init } from '@waline/client';
import '@waline/client/style';
import { useTheme } from 'next-themes';
import { GlowCard } from "@/components/ui/glow-card";
import { FadeInOnScroll } from "@/components/scroll-animations";
import { MessageSquare } from "lucide-react";

export const WalineGuestbook = () => {
  const walineInstanceRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    walineInstanceRef.current = init({
      el: containerRef.current,
      serverURL: 'https://waline.vercel.app', // Placeholder URL, user should replace this
      dark: 'html.dark',
      emoji: [
        'https://unpkg.com/@waline/emojis@1.1.0/weibo',
        'https://unpkg.com/@waline/emojis@1.1.0/bilibili',
      ],
      search: false,
      imageUploader: false,
      locale: {
        placeholder: 'Say hello, drop a message, or just leave your footprints here...',
      },
    });

    return () => {
      walineInstanceRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    walineInstanceRef.current?.update({
      dark: 'html.dark',
    });
  }, [theme]);

  return (
    <section className="space-y-8">
      <FadeInOnScroll>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0d47c4] via-[#136bfe] to-[#3b82f6] bg-clip-text text-transparent flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-[#136bfe]" />
            Guestbook
          </h2>
          <p className="text-sm text-muted-foreground">
            Feel free to leave a comment below! Note: Server URL needs to be updated.
          </p>
        </div>
      </FadeInOnScroll>

      <FadeInOnScroll delay={0.2}>
        <GlowCard hoverScale={1.01}>
          <div className="p-5 sm:p-8">
            <div ref={containerRef} />
          </div>
        </GlowCard>
      </FadeInOnScroll>
      
      {/* Waline CSS Overrides for Theme Matching */}
      <style>{`
        :root {
          --waline-theme-color: #136bfe;
          --waline-active-color: #0d47c4;
          --waline-border: 1px solid var(--border);
          --waline-bg-color: transparent;
          --waline-bg-color-light: transparent;
          --waline-bg-color-hover: var(--accent);
          --waline-info-color: var(--muted-foreground);
          --waline-text-color: var(--foreground);
          --waline-border-color: var(--border);
        }
        html.dark {
          --waline-border: 1px solid var(--border);
          --waline-bg-color: transparent;
          --waline-bg-color-light: transparent;
          --waline-bg-color-hover: var(--accent);
          --waline-info-color: var(--muted-foreground);
          --waline-text-color: var(--foreground);
          --waline-border-color: var(--border);
        }
        .wl-panel {
          border-radius: 0.5rem;
          background: transparent !important;
        }
        .wl-btn {
          border-radius: 0.5rem;
        }
      `}</style>
    </section>
  );
};
