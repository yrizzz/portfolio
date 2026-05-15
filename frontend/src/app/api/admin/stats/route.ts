import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Project } from \'@/models\';
import { User, ApiKey, ApiRequest, Project } from '@/models';
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectDB();
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [totalUsers, activeApiKeys, totalRequests, totalProjects] = await Promise.all([
      User.countDocuments(),
      ApiKey.countDocuments({ isActive: true }),
      ApiRequest.countDocuments(),
      Project.countDocuments(),
    ]);

    return NextResponse.json({
      totalUsers,
      activeApiKeys,
      totalRequests,
      totalProjects,
    });
  } catch (error: any) {
    console.error('Failed to fetch admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    );
  }
}
