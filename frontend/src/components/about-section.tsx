"use client";

import { useState, useEffect } from "react";
import { GlowCard } from "@/components/ui/glow-card";
import { FadeInOnScroll, StaggerContainer, StaggerItem } from "@/components/scroll-animations";

interface Skill {
  id: string;
  name: string;
  slug: string;
  category: string;
}

interface SkillCategory {
  title: string;
  skills: Skill[];
}

export function AboutSection() {
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/skills')
      .then(res => res.json())
      .then(data => {
        // Handle both old and new response format
        const skillsData = data.success && data.skills ? data.skills : data;
        // Group skills by category
        const grouped = data.reduce((acc: any, skill: Skill) => {
          if (!acc[skill.category]) {
            acc[skill.category] = [];
          }
          acc[skill.category].push(skill);
          return acc;
        }, {});

        const categories = Object.keys(grouped).map(category => ({
          title: category,
          skills: grouped[category]
        }));

        setSkillCategories(categories);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load skills:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="space-y-8">
        <div className="text-center py-12">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto"></div>
        </div>
      </section>
    );
  }
  return (
    <section className="space-y-8">
      <FadeInOnScroll>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0d47c4] via-[#136bfe] to-[#3b82f6] bg-clip-text text-transparent">
            Skills & Tools
          </h2>
          <p className="text-sm text-muted-foreground">
            Technologies I work with every day
          </p>
        </div>
      </FadeInOnScroll>

      {/* Skill categories in a grid */}
      <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {skillCategories.map((category) => (
          <StaggerItem key={category.title}>
            <GlowCard hoverScale={1.03}>
              <div className="p-5 space-y-4">
                {/* Category header */}
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  {category.title}
                </h3>

                {/* Icon grid */}
                <div className="grid grid-cols-2 gap-3">
                  {category.skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="skill-icon-item flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50 cursor-default transition-all duration-300 hover:-translate-y-1 hover:bg-accent hover:shadow-sm"
                    >
                      <div className="h-8 w-8 flex items-center justify-center">
                        <img
                          src={`https://cdn.simpleicons.org/${skill.slug}`}
                          alt={`${skill.name} icon`}
                          className="h-6 w-6"
                        />
                      </div>
                      <span className="text-xs font-medium text-center leading-tight">
                        {skill.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </GlowCard>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}
