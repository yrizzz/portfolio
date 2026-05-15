import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User, ApiKey } from '@/models';
import crypto from 'crypto';

// GET - List all API keys for current user
export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const apiKeys = await ApiKey.find({ userId: user._id.toString() })
      .sort({ createdAt: -1 })
      .lean();

    const mapped = apiKeys.map(k => ({
      id: k._id.toString(),
      key: k.key,
      name: k.name,
      isActive: k.isActive,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt,
    }));

    return NextResponse.json({ apiKeys: mapped });

  } catch (error: any) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new API key
export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate API key
    const key = `pk_${crypto.randomBytes(32).toString('hex')}`;

    const apiKey = await ApiKey.create({
      key,
      userId: user._id.toString(),
      name,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      apiKey: {
        id: apiKey._id.toString(),
        key: apiKey.key,
        name: apiKey.name,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
      }
    });

  } catch (error: any) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete API key
export async function DELETE(request: NextRequest) {
  await connectDB();
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify ownership
    const apiKey = await ApiKey.findById(keyId).lean();
    
    if (!apiKey || apiKey.userId !== user._id.toString()) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    await ApiKey.findByIdAndDelete(keyId);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key', details: error.message },
      { status: 500 }
    );
  }
}
