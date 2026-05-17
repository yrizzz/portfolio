"use client";

import { useState, useEffect } from "react";
import { GlowCard } from "@/components/ui/glow-card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { FadeInOnScroll, StaggerContainer, StaggerItem } from "@/components/scroll-animations";

// Data will be loaded from API

export function ExperienceSection() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/experiences')
      .then(res => res.json())
      .then(data => {
        setExperiences(data.experiences || []);
        setEducation(data.education || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load experiences:', err);
        setLoading(false);
      });
  }, []);

  const formatPeriod = (startDate: string, endDate: string | null, current: boolean) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    const end = current ? 'Present' : endDate ? new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '';
    return `${start} - ${end}`;
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="text-center py-12">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto"></div>
        </div>
      </section>
    );
  }
  return (
    <section className="space-y-6">
      <FadeInOnScroll>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0d47c4] via-[#136bfe] to-[#3b82f6] bg-clip-text text-transparent">
            Experience
          </h2>
          <p className="text-sm text-muted-foreground">
            My professional journey
          </p>
        </div>
      </FadeInOnScroll>

      <div className="relative ml-0 space-y-8 py-2 mt-8">
        {/* Continuous Timeline Line - Centered */}
        <div className="absolute left-[12px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#136bfe] via-[#136bfe] to-[#136bfe]/30" />
        
        <StaggerContainer className="space-y-8">
          {experiences.map((exp, index) => (
            <StaggerItem key={exp.id} className="relative pl-8 sm:pl-10">
              {/* Timeline Dot - Centered vertically on card and aligned with line */}
              <div className="absolute left-[11px] sm:left-[13px] top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center z-10">
                <div className="relative">
                  <div className="h-6 w-6 rounded-full bg-[#136bfe] flex items-center justify-center ring-4 ring-background">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  {exp.current && (
                    <span className="absolute inset-0 rounded-full bg-[#136bfe] animate-ping opacity-75" />
                  )}
                </div>
              </div>
              
              <GlowCard hoverScale={1.01}>
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">{exp.title}</h3>
                      <p className="text-sm font-medium text-muted-foreground">{exp.company}</p>
                    </div>
                    {exp.current && (
                      <div>
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-green-600 dark:bg-green-400" />
                          Current
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatPeriod(exp.startDate, exp.endDate, exp.current)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {exp.location}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{exp.description}</p>
                </div>
              </GlowCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      <FadeInOnScroll delay={0.3}>
        <div id="education" className="mt-8 pt-8">
          <h2 className="mb-4 text-3xl font-bold bg-gradient-to-r from-[#0d47c4] via-[#136bfe] to-[#3b82f6] bg-clip-text text-transparent">
            Education
          </h2>
          <div className="relative ml-0 space-y-8 py-2 mt-8">
            {/* Continuous Timeline Line */}
            <div className="absolute left-[11px] sm:left-[13px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#136bfe] via-[#136bfe] to-[#136bfe]/30" />
            
            <StaggerContainer className="space-y-8">
              {education.map((edu, index) => (
                <StaggerItem key={edu.id} className="relative pl-8 sm:pl-10">
                  {/* Timeline Dot - Centered vertically on card and aligned with line */}
                  <div className="absolute left-[11px] sm:left-[13px] top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center z-10">
                    <div className="h-6 w-6 rounded-full bg-[#136bfe] flex items-center justify-center ring-4 ring-background">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  </div>
                  <GlowCard hoverScale={1.01}>
                    <div className="p-5 space-y-3">
                      <h3 className="text-lg font-semibold">{edu.degree}</h3>
                      <p className="text-sm font-medium text-muted-foreground">{edu.institution}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatPeriod(edu.startDate, edu.endDate, false)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {edu.location}
                        </div>
                      </div>
                    </div>
                  </GlowCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </FadeInOnScroll>
    </section>
  );
}
