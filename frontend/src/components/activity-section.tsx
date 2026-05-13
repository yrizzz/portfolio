"use client";

import { FadeInOnScroll } from "@/components/scroll-animations";
import { GlowCard } from "@/components/ui/glow-card";
import { Activity, Code2, Gauge, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { GitHubCalendar } from "react-github-calendar";
import { useTheme } from "next-themes";

// Mock Data for the Dashboard
const pageSpeedData = [
  { label: "Performance", value: 98, color: "text-green-500" },
  { label: "Accessibility", value: 96, color: "text-green-500" },
  { label: "Best Practices", value: 96, color: "text-green-500" },
  { label: "SEO", value: 100, color: "text-green-500" },
];

const CircularProgress = ({ value, label, colorClass }: { value: number, label: string, colorClass: string }) => {
  const [currentValue, setCurrentValue] = useState(0);
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentValue / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setCurrentValue(value), 500);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-20 w-20 flex items-center justify-center">
        <svg className="transform -rotate-90 w-20 h-20">
          <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-muted/20" />
          <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-bold text-sm">
          {currentValue}%
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-medium text-center">{label}</span>
    </div>
  );
};

export function ActivitySection() {
  const { theme } = useTheme();

  return (
    <section className="space-y-8">
      <FadeInOnScroll>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0d47c4] via-[#136bfe] to-[#3b82f6] bg-clip-text text-transparent flex items-center gap-2">
            <Activity className="h-6 w-6 text-[#136bfe]" />
            Activity
          </h2>
          <p className="text-sm text-muted-foreground">
            My statistics, contributions, and performance metrics.
          </p>
        </div>
      </FadeInOnScroll>

      <div className="grid gap-6 grid-cols-1">
        
        {/* PageSpeed Insights */}
        <FadeInOnScroll delay={0.1}>
          <GlowCard hoverScale={1.01}>
            <div className="p-5 sm:p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Gauge className="h-5 w-5" />
                  PageSpeed Insights
                </div>
                <span className="text-xs text-muted-foreground font-mono">@pagespeed</span>
              </div>
              <p className="text-sm text-muted-foreground">Page Speed Index by Google API</p>
              
              <div className="flex flex-wrap gap-6 pt-2">
                {pageSpeedData.map((data) => (
                  <CircularProgress key={data.label} {...data} colorClass={data.color} />
                ))}
              </div>
            </div>
          </GlowCard>
        </FadeInOnScroll>

        {/* GitHub Contributions */}
        <FadeInOnScroll delay={0.2}>
          <GlowCard hoverScale={1.01}>
            <div className="p-5 sm:p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <img src="https://cdn.simpleicons.org/github/white" alt="GitHub" className="h-5 w-5 dark:invert-0 invert" />
                  GitHub Contributions
                </div>
                <span className="text-xs text-muted-foreground font-mono">@yrizzz</span>
              </div>
              <p className="text-sm text-muted-foreground">My contributions from last year on github.</p>
              
              <div className="pt-2 w-full overflow-x-auto custom-scrollbar pb-4 flex justify-center">
                <GitHubCalendar 
                  username="yrizzz" 
                  colorScheme={theme === "dark" ? "dark" : "light"}
                  blockSize={14}
                  blockMargin={5}
                  fontSize={14}
                />
              </div>
            </div>
          </GlowCard>
        </FadeInOnScroll>

        {/* LeetCode Statistics */}
        <FadeInOnScroll delay={0.3}>
          <GlowCard hoverScale={1.01}>
            <div className="p-5 sm:p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Code2 className="h-5 w-5" />
                  LeetCode Statistics
                </div>
                <span className="text-xs text-muted-foreground font-mono">@yrizzz</span>
              </div>
              <p className="text-sm text-muted-foreground">My LeetCode statistics progress and performance.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 bg-background/50 flex flex-col justify-between">
                  <div className="text-xs text-muted-foreground mb-2">Acceptance Rate</div>
                  <div className="text-2xl font-bold text-green-500">67 <span className="text-sm font-normal text-muted-foreground">%</span></div>
                </div>
                <div className="border rounded-lg p-4 bg-background/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-muted-foreground">Contribution Points</div>
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-green-500">85</div>
                </div>
                <div className="border rounded-lg p-4 bg-background/50 flex flex-col justify-between">
                  <div className="text-xs text-muted-foreground mb-2">Completed (Easy - Medium - Hard)</div>
                  <div className="text-2xl font-bold text-green-500 flex items-center gap-2">
                    53
                    <span className="text-sm font-normal text-muted-foreground ml-auto">
                      <span className="text-[#00b8a3]">39</span> - <span className="text-[#ffc01e]">11</span> - <span className="text-[#ff375f]">3</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </GlowCard>
        </FadeInOnScroll>

      </div>
    </section>
  );
}
