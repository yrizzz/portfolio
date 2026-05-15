import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User, ApiKey } from '@/models';

// PATCH - Toggle API key active status
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

    const { id, isActive } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }

    // Verify ownership
    const apiKey = await ApiKey.findOne({ 
        id,
        userId: user._id 
      });

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    const updatedKey = await ApiKey.findByIdAndUpdate( id , { isActive: isActive ?? !Apikey.isActive });

    return NextResponse.json({ 
      apiKey: updatedKey,
      message: `API key ${updatedKey.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling API key:', error);
    return NextResponse.json({ error: 'Failed to toggle API key' }, { status: 500 });
  }
}
