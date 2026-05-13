import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get API analytics and monitoring data
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
    const period = searchParams.get('period') || '24h'; // 24h, 7d, 30d

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
    }

    // Get total requests
    const totalRequests = await prisma.apiRequest.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Get requests by status code
    const requestsByStatus = await prisma.apiRequest.groupBy({
      by: ['statusCode'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        statusCode: true,
      },
    });

    // Get requests by endpoint
    const requestsByEndpoint = await prisma.apiRequest.groupBy({
      by: ['endpoint'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        endpoint: true,
      },
      orderBy: {
        _count: {
          endpoint: 'desc',
        },
      },
      take: 10,
    });

    // Get average response time
    const avgResponseTime = await prisma.apiRequest.aggregate({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _avg: {
        responseTime: true,
      },
    });

    // Get total endpoints
    const totalEndpoints = await prisma.apiEndpoint.count();
    const activeEndpoints = await prisma.apiEndpoint.count({
      where: { enabled: true },
    });

    // Get recent errors (status >= 400)
    const recentErrors = await prisma.apiRequest.findMany({
      where: {
        statusCode: {
          gte: 400,
        },
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Calculate success rate
    const successfulRequests = await prisma.apiRequest.count({
      where: {
        statusCode: {
          lt: 400,
        },
        createdAt: {
          gte: startDate,
        },
      },
    });

    const successRate = totalRequests > 0 
      ? ((successfulRequests / totalRequests) * 100).toFixed(2)
      : '0';

    return NextResponse.json({
      success: true,
      period,
      summary: {
        totalRequests,
        totalEndpoints,
        activeEndpoints,
        successRate: parseFloat(successRate),
        avgResponseTime: avgResponseTime._avg.responseTime || 0,
      },
      requestsByStatus: requestsByStatus.map(r => ({
        statusCode: r.statusCode,
        count: r._count.statusCode,
      })),
      requestsByEndpoint: requestsByEndpoint.map(r => ({
        endpoint: r.endpoint,
        count: r._count.endpoint,
      })),
      recentErrors,
    });

  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    );
  }
}
