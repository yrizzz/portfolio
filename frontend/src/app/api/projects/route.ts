import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
    });

    // Map DB fields to frontend format
    const mapped = projects.map((p: any) => ({
      id: p.id,
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
    const data = await req.json();

    // Handle bulk save (from admin page)
    if (Array.isArray(data)) {
      // Delete all and recreate
      await prisma.project.deleteMany();

      for (let i = 0; i < data.length; i++) {
        const p = data[i];
        await prisma.project.create({
          data: {
            id: p.id || crypto.randomUUID(),
            title: p.title,
            description: p.description || '',
            image: p.image || null,
            techStack: Array.isArray(p.tags) ? p.tags.join(', ') : (p.techStack || ''),
            demoUrl: p.liveUrl || p.demoUrl || null,
            githubUrl: p.githubUrl || null,
            featured: p.featured || false,
            order: i,
            published: true,
            updatedAt: new Date(),
          },
        });
      }

      return NextResponse.json({ success: true });
    }

    // Single project create
    const project = await prisma.project.create({
      data: {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description || '',
        image: data.image || null,
        techStack: Array.isArray(data.tags) ? data.tags.join(', ') : (data.techStack || ''),
        demoUrl: data.liveUrl || data.demoUrl || null,
        githubUrl: data.githubUrl || null,
        featured: data.featured || false,
        order: data.order || 0,
        published: true,
        updatedAt: new Date(),
      },
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
