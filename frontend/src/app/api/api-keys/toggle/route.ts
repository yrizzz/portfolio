import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User, ApiKey } from '@/models';

// PATCH - Toggle API key active status
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const { id, isActive } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Key ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const apiKey = await ApiKey.findOne({ 
      _id: id,
      userId: user._id 
    });

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key not found' },
        { status: 404 }
      );
    }

    const updatedKey = await ApiKey.findByIdAndUpdate(
      id,
      { isActive: isActive ?? !apiKey.isActive },
      { new: true }
    );

    return NextResponse.json({ 
      success: true,
      apiKey: updatedKey,
      message: `API key ${updatedKey?.isActive ? 'activated' : 'deactivated'} successfully`
    });
    
  } catch (error: any) {
    console.error('[API-Keys Toggle] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to toggle API key',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
