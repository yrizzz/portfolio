import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "skills.json");

// Default skills data
const defaultSkills = [
  { id: "1", name: "React", slug: "react", category: "Frontend" },
  { id: "2", name: "Next.js", slug: "nextdotjs", category: "Frontend" },
  { id: "3", name: "TypeScript", slug: "typescript", category: "Frontend" },
  { id: "4", name: "Tailwind", slug: "tailwindcss", category: "Frontend" },
  { id: "5", name: "Laravel", slug: "laravel", category: "Backend" },
  { id: "6", name: "Node.js", slug: "nodedotjs", category: "Backend" },
  { id: "7", name: "MySQL", slug: "mysql", category: "Database & ORM" },
  { id: "8", name: "PostgreSQL", slug: "postgresql", category: "Database & ORM" },
  { id: "9", name: "Git", slug: "git", category: "Tools" },
  { id: "10", name: "Docker", slug: "docker", category: "Tools" },
];

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize file if not exists
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify(defaultSkills, null, 2));
}

export async function GET() {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const skills = JSON.parse(data);
    return NextResponse.json(skills);
  } catch (error) {
    return NextResponse.json(defaultSkills);
  }
}

export async function POST(request: Request) {
  try {
    const skills = await request.json();
    fs.writeFileSync(filePath, JSON.stringify(skills, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save skills" }, { status: 500 });
  }
}
