"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { AnimatedButton, AnimatedButtonGroup } from "@/components/ui/animated-button";
import { GlowCard } from "@/components/ui/glow-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Star } from "lucide-react";
import { FadeInOnScroll, StaggerContainer, StaggerItem } from "@/components/scroll-animations";

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
  category: string;
  featured?: boolean;
}

// Projects will be loaded from API

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <GlowCard hoverScale={1.02}>
      <div className="flex flex-col">
        {/* Image - Full width di atas */}
        <div className="relative w-full h-56 rounded-t-xl overflow-hidden group">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
          />
          {project.featured && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400 shadow-lg">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Featured
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-3">
          <h3 className="font-semibold text-lg">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <AnimatedButtonGroup className="mt-2">
            <AnimatedButton
              size="sm"
              className="flex-1"
              hoverScale={1.08}
              onClick={() => window.open(project.liveUrl, "_blank")}
            >
              <ExternalLink className="mr-1.5 h-3 w-3" />
              Live Demo
            </AnimatedButton>
            <AnimatedButton
              size="sm"
              variant="outline"
              className="flex-1"
              hoverScale={1.08}
              onClick={() => window.open(project.githubUrl, "_blank")}
            >
              <svg className="mr-1.5 h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View Code
            </AnimatedButton>
          </AnimatedButtonGroup>
        </div>
      </div>
    </GlowCard>
  );
}

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        // Handle both old and new response format
        const projectsData = data.success && data.projects ? data.projects : data;
        setProjects(projectsData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load projects:', err);
        setLoading(false);
      });
  }, []);

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
            Projects
          </h2>
          <p className="text-sm text-muted-foreground">
            My recent work showcasing modern web development
          </p>
        </div>
      </FadeInOnScroll>

      <Tabs defaultValue="all" className="space-y-4">
        <div>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="fullstack">Full Stack</TabsTrigger>
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
            <TabsTrigger value="backend">Backend</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-4">
          <StaggerContainer className="grid gap-6 lg:grid-cols-4">
            {projects.map((project, index) => (
              <StaggerItem key={project.id}>
                <ProjectCard project={project} index={index} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </TabsContent>

        {["fullstack", "frontend", "backend"].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <StaggerContainer className="grid gap-6 lg:grid-cols-2">
              {projects
                .filter((p) => p.category === category)
                .map((project, index) => (
                  <StaggerItem key={project.id}>
                    <ProjectCard project={project} index={index} />
                  </StaggerItem>
                ))}
            </StaggerContainer>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
