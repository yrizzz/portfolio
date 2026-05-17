import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, ApiKey, ApiRequest, Project } from '@/models';
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin only' },
        { status: 403 }
      );
    }

    const [totalUsers, activeApiKeys, totalRequests, totalProjects] = await Promise.all([
      User.countDocuments(),
      ApiKey.countDocuments({ isActive: true }),
      ApiRequest.countDocuments(),
      Project.countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      totalUsers,
      activeApiKeys,
      totalRequests,
      totalProjects,
    });
    
  } catch (error: any) {
    console.error('[Admin Stats GET] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch stats',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
