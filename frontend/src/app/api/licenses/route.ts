import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User, License } from '@/models';

// GET - List all licenses for current user
export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({
      { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const licenses = await License.find({
      { userId: user.id },
      .sort({ createdAt: -1 }),
    });

    return NextResponse.json({ licenses });
  } catch (error) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json({ error: 'Failed to fetch licenses' }, { status: 500 });
  }
}

// POST - Purchase new license
export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({
      { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { type } = await request.json();

    if (!['DAILY', 'WEEKLY', 'MONTHLY'].includes(type)) {
      return NextResponse.json({ error: 'Invalid license type' }, { status: 400 });
    }

    // Define pricing and duration
    const licenseConfig: Record<string, { price: number; days: number }> = {
      DAILY: { price: 5, days: 1 },
      WEEKLY: { price: 25, days: 7 },
      MONTHLY: { price: 80, days: 30 },
    };

    const config = licenseConfig[type];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + config.days);

    // TODO: Integrate with payment gateway (Stripe, PayPal, etc.)
    // For now, we'll create the license directly (demo mode)

    const license = await License.create({
      data: {
        userId: user.id,
        type,
        price: config.price,
        startDate,
        endDate,
        isActive: true,
        autoRenew: false,
      },
    });

    return NextResponse.json({ 
      license,
      message: 'License purchased successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error purchasing license:', error);
    return NextResponse.json({ error: 'Failed to purchase license' }, { status: 500 });
  }
}

// DELETE - Cancel license
export async function DELETE(request: NextRequest) {
  await connectDB();
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({
      { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const licenseId = searchParams.get('id');

    if (!licenseId) {
      return NextResponse.json({ error: 'License ID is required' }, { status: 400 });
    }

    // Verify ownership
    const license = await License.findOne({
      { 
        id: licenseId,
        userId: user.id 
      }
    });

    if (!license) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }

    // Deactivate license instead of deleting
    await License.findByIdAndUpdate({
      { id: licenseId },
      data: { 
        isActive: false,
        autoRenew: false 
      }
    });

    return NextResponse.json({ message: 'License canceled successfully' });
  } catch (error) {
    console.error('Error canceling license:', error);
    return NextResponse.json({ error: 'Failed to cancel license' }, { status: 500 });
  }
}
