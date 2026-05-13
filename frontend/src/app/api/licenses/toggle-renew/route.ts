import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// PATCH - Toggle auto-renew status
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id, autoRenew } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'License ID is required' }, { status: 400 });
    }

    // Verify ownership
    const license = await prisma.license.findFirst({
      where: { 
        id,
        userId: user.id 
      }
    });

    if (!license) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }

    const updatedLicense = await prisma.license.update({
      where: { id },
      data: { autoRenew: autoRenew ?? !license.autoRenew }
    });

    return NextResponse.json({ 
      license: updatedLicense,
      message: `Auto-renew ${updatedLicense.autoRenew ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    console.error('Error toggling auto-renew:', error);
    return NextResponse.json({ error: 'Failed to toggle auto-renew' }, { status: 500 });
  }
}
