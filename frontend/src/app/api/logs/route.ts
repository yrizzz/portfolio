import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get API request logs
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const endpoint = searchParams.get('endpoint');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (endpoint) where.endpoint = endpoint;

    const [logs, total] = await Promise.all([
      prisma.apiRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.apiRequest.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      logs,
      total,
      limit,
      offset,
    });

  } catch (error: any) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs', details: error.message },
      { status: 500 }
    );
  }
}
