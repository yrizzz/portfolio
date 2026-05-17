import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models';
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectDB();
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('name email image role createdAt')
      .lean();

    const mapped = users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      image: u.image,
      role: u.role,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ users: mapped });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
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

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or role' },
        { status: 400 }
      );
    }

    if (!['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    await User.findByIdAndUpdate(userId, { role });

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('[Admin Users PATCH] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update user',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    );
  }
}
