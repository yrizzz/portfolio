import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { order: 'asc' },
    });

    const mapped = skills.map((s: any) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      category: s.category,
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('Failed to fetch skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Handle bulk save (from admin page)
    if (Array.isArray(data)) {
      await prisma.skill.deleteMany();

      for (let i = 0; i < data.length; i++) {
        const s = data[i];
        await prisma.skill.create({
          data: {
            id: s.id || crypto.randomUUID(),
            name: s.name,
            slug: s.slug || s.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
            category: s.category || 'Other',
            order: i,
          },
        });
      }

      return NextResponse.json({ success: true });
    }

    // Single skill create
    const skill = await prisma.skill.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        category: data.category || 'Other',
        order: data.order || 0,
      },
    });

    return NextResponse.json({ success: true, skill });
  } catch (error: any) {
    console.error('Failed to save skills:', error);
    return NextResponse.json(
      { error: 'Failed to save skills', details: error.message },
      { status: 500 }
    );
  }
}
