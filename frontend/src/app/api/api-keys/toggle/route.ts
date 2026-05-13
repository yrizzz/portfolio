import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH - Toggle API key active status
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id, isActive } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }

    // Verify ownership
    const apiKey = await prisma.apiKey.findFirst({
      where: { 
        id,
        userId: user.id 
      }
    });

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    const updatedKey = await prisma.apiKey.update({
      where: { id },
      data: { isActive: isActive ?? !apiKey.isActive }
    });

    return NextResponse.json({ 
      apiKey: updatedKey,
      message: `API key ${updatedKey.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling API key:', error);
    return NextResponse.json({ error: 'Failed to toggle API key' }, { status: 500 });
  }
}
