import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Contact info is stored in SiteConfig with key prefix 'contact_'
export async function GET() {
  try {
    const configs = await prisma.siteConfig.findMany({
      where: { key: { startsWith: 'contact_' } },
    });

    // Parse contact items from config
    const contactJson = configs.find((c: any) => c.key === 'contact_items');
    
    if (contactJson) {
      try {
        const items = JSON.parse(contactJson.value);
        return NextResponse.json(items);
      } catch {
        return NextResponse.json([]);
      }
    }

    return NextResponse.json([]);
  } catch (error: any) {
    console.error('Failed to fetch contact info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact info', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Store contact items as JSON in SiteConfig
    await prisma.siteConfig.upsert({
      where: { key: 'contact_items' },
      update: { value: JSON.stringify(data), updatedAt: new Date() },
      create: { id: crypto.randomUUID(), key: 'contact_items', value: JSON.stringify(data), updatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to save contact info:', error);
    return NextResponse.json(
      { error: 'Failed to save contact info', details: error.message },
      { status: 500 }
    );
  }
}
