import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: { order: 'asc' },
    });

    const education = await prisma.education.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      experiences: experiences.map((e: any) => ({
        id: e.id,
        title: e.title,
        company: e.company,
        location: e.location,
        period: e.period,
        description: e.description,
        current: e.current,
      })),
      education: education.map((e: any) => ({
        id: e.id,
        degree: e.degree,
        institution: e.institution,
        location: e.location,
        period: e.period,
      })),
    });
  } catch (error: any) {
    console.error('Failed to fetch experiences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experiences', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { experiences, education } = data;

    // Save experiences
    if (experiences && Array.isArray(experiences)) {
      await prisma.experience.deleteMany();

      for (let i = 0; i < experiences.length; i++) {
        const exp = experiences[i];
        await prisma.experience.create({
          data: {
            id: exp.id || crypto.randomUUID(),
            title: exp.title,
            company: exp.company,
            location: exp.location || '',
            period: exp.period || `${exp.startDate || ''} - ${exp.endDate || 'Present'}`,
            description: exp.description || '',
            current: exp.current || false,
            order: i,
            updatedAt: new Date(),
          },
        });
      }
    }

    // Save education
    if (education && Array.isArray(education)) {
      await prisma.education.deleteMany();

      for (let i = 0; i < education.length; i++) {
        const edu = education[i];
        await prisma.education.create({
          data: {
            id: edu.id || crypto.randomUUID(),
            degree: edu.degree,
            institution: edu.institution,
            location: edu.location || '',
            period: edu.period || `${edu.startDate || ''} - ${edu.endDate || ''}`,
            order: i,
            updatedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to save experiences:', error);
    return NextResponse.json(
      { error: 'Failed to save experiences', details: error.message },
      { status: 500 }
    );
  }
}
