import { NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const PROFILE_FILE = path.join(DATA_DIR, "profile.json");

const defaultProfile = {
  name: "YrizzzDev",
  title: "Full Stack Developer",
  subtitle: "Full-Stack Web Specialist 🚀",
  location: "Indonesia",
  bio1: "With over 5 years of professional experience, I specialize in crafting robust and scalable web applications. My expertise lies in building modern, high-performance solutions using Laravel and Livewire.",
  bio2: "From concept to deployment, I deliver end-to-end solutions that combine elegant code architecture with exceptional user experiences.",
  avatarUrl: "/profile.jpg",
  status: "Available to be partner",
  cvUrl: "/cv.pdf",
  socialLinks: [
    { id: "1", url: "https://github.com/yrizzz", icon: "github" },
    { id: "2", url: "https://linkedin.com", icon: "linkedin" }
  ]
};

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

export async function GET() {
  try {
    await ensureDataDir();
    if (existsSync(PROFILE_FILE)) {
      const data = await readFile(PROFILE_FILE, "utf-8");
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json(defaultProfile);
  } catch (error) {
    console.error("Error loading profile:", error);
    return NextResponse.json(defaultProfile);
  }
}

export async function POST(request: Request) {
  try {
    await ensureDataDir();
    const data = await request.json();
    
    if (!data.name || !data.title || !data.location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    await writeFile(PROFILE_FILE, JSON.stringify(data, null, 2), "utf-8");
    
    return NextResponse.json({ 
      success: true, 
      message: "Profile updated successfully" 
    });
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}
