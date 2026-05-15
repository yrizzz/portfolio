import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User, License } from '@/models';

// PATCH - Toggle auto-renew status
export async function PATCH(request: NextRequest) {
  await connectDB();
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id, autoRenew } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'License ID is required' }, { status: 400 });
    }

    // Verify ownership
    const license = await License.findOne({ 
        id,
        userId: user._id 
      });

    if (!license) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }

    const updatedLicense = await License.findByIdAndUpdate( id , { autoRenew: autoRenew ?? !License.autoRenew });

    return NextResponse.json({ 
      license: updatedLicense,
      message: `Auto-renew ${updatedLicense.autoRenew ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    console.error('Error toggling auto-renew:', error);
    return NextResponse.json({ error: 'Failed to toggle auto-renew' }, { status: 500 });
  }
}
