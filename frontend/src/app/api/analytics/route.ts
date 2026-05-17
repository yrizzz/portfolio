import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { ApiRequest, ApiEndpoint } from '@/models';

// GET - Get API analytics and monitoring data
export async function GET(req: NextRequest) {
  await connectDB();
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
    const totalRequests = await ApiRequest.countDocuments({
      createdAt: { $gte: startDate },
    });

    // Get requests by status code using aggregation
    const requestsByStatus = await ApiRequest.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$statusCode', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Get requests by endpoint
    const requestsByEndpoint = await ApiRequest.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$endpoint', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get average response time
    const avgResponseTime = await ApiRequest.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: null, avg: { $avg: '$responseTime' } } }
    ]);

    // Get recent requests
    const recentRequests = await ApiRequest.find({
      createdAt: { $gte: startDate }
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Get endpoint stats
    const endpoints = await ApiEndpoint.find({ enabled: true }).lean();
    const endpointStats = await Promise.all(
      endpoints.map(async (endpoint) => {
        const count = await ApiRequest.countDocuments({
          endpoint: endpoint.path,
          createdAt: { $gte: startDate }
        });
        
        const avgTime = await ApiRequest.aggregate([
          { $match: { endpoint: endpoint.path, createdAt: { $gte: startDate } } },
          { $group: { _id: null, avg: { $avg: '$responseTime' } } }
        ]);

        return {
          endpoint: endpoint.path,
          name: endpoint.name,
          requests: count,
          avgResponseTime: avgTime[0]?.avg || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      period,
      totalRequests,
      requestsByStatus: requestsByStatus.map(r => ({
        statusCode: r._id,
        count: r.count
      })),
      requestsByEndpoint: requestsByEndpoint.map(r => ({
        endpoint: r._id,
        count: r.count
      })),
      avgResponseTime: avgResponseTime[0]?.avg || 0,
      recentRequests: recentRequests.map(r => ({
        id: r._id.toString(),
        endpoint: r.endpoint,
        method: r.method,
        statusCode: r.statusCode,
        responseTime: r.responseTime,
        ipAddress: r.ipAddress,
        createdAt: r.createdAt,
      })),
      endpointStats,
    });

  } catch (error: any) {
    console.error('[Analytics GET] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
