import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const projectsFile = path.join(dataDir, 'projects.json');

// Default projects data
const defaultProjects = [
  {
    id: "1",
    title: "E-Commerce Platform",
    description: "Full-stack e-commerce solution with payment integration and admin dashboard.",
    image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=400&h=300&fit=crop",
    tags: ["Next.js", "TypeScript", "Prisma", "Stripe"],
    liveUrl: "#",
    githubUrl: "#",
    category: "fullstack",
    featured: true,
  },
  {
    id: "2",
    title: "Task Management App",
    description: "Collaborative task management tool with real-time updates.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop",
    tags: ["React", "Node.js", "Socket.io", "MongoDB"],
    liveUrl: "#",
    githubUrl: "#",
    category: "fullstack",
    featured: false,
  },
];

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// GET - Load projects
export async function GET() {
  try {
    if (fs.existsSync(projectsFile)) {
      const data = fs.readFileSync(projectsFile, 'utf-8');
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json(defaultProjects);
  } catch (error) {
    console.error('Error loading projects:', error);
    return NextResponse.json(defaultProjects);
  }
}

// POST - Save projects
export async function POST(request: Request) {
  try {
    const projects = await request.json();
    fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2));
    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error('Error saving projects:', error);
    return NextResponse.json({ error: 'Failed to save projects' }, { status: 500 });
  }
}
