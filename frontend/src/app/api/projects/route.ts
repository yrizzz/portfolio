import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Project } from '@/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const projects = await Project.find({ published: true }).sort({ order: 1 }).lean();

    // Map DB fields to frontend format
    const mapped = projects.map((p: any) => ({
      id: p._id.toString(),
      title: p.title,
      description: p.description,
      image: p.image || '',
      tags: p.techStack ? p.techStack.split(',').map((t: string) => t.trim()) : [],
      liveUrl: p.demoUrl || '',
      githubUrl: p.githubUrl || '',
      category: p.category || 'fullstack',
      featured: p.featured,
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const data = await req.json();

    // Handle bulk save (from admin page)
    if (Array.isArray(data)) {
      // Delete all and recreate
      await Project.deleteMany({});

      const projects = data.map((p, i) => ({
        title: p.title,
        description: p.description || '',
        image: p.image || null,
        techStack: Array.isArray(p.tags) ? p.tags.join(', ') : (p.techStack || ''),
        demoUrl: p.liveUrl || p.demoUrl || null,
        githubUrl: p.githubUrl || null,
        featured: p.featured || false,
        order: i,
        published: true,
      }));

      await Project.insertMany(projects);

      return NextResponse.json({ success: true });
    }

    // Single project create
    const project = await Project.create({
      title: data.title,
      description: data.description || '',
      image: data.image || null,
      techStack: Array.isArray(data.tags) ? data.tags.join(', ') : (data.techStack || ''),
      demoUrl: data.liveUrl || data.demoUrl || null,
      githubUrl: data.githubUrl || null,
      featured: data.featured || false,
      order: data.order || 0,
      published: true,
    });

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error('Failed to save projects:', error);
    return NextResponse.json(
      { error: 'Failed to save projects', details: error.message },
      { status: 500 }
    );
  }
}
