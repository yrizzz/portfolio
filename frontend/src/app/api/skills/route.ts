import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Skill } from '@/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectDB();
  try {
    const skills = await Skill.find({
      .sort({ order: 1 }),
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
  await connectDB();
  try {
    const data = await req.json();

    // Handle bulk save (from admin page)
    if (Array.isArray(data)) {
      await Skill.deleteMany();

      for (let i = 0; i < data.length; i++) {
        const s = data[i];
        await Skill.create({
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
    const skill = await Skill.create({
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
