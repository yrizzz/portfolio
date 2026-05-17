import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { SiteConfig } from '@/models';

// GET - Get site config
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin only' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (key) {
      console.log('[Config GET] Fetching config for key:', key);
      const config = await SiteConfig.findOne({ key });
      
      console.log('[Config GET] Found config:', config ? 'Yes' : 'No');
      
      return NextResponse.json({
        success: true,
        config,
      });
    }

    const configs = await SiteConfig.find();
    
    return NextResponse.json({
      success: true,
      configs,
    });

  } catch (error: any) {
    console.error('[Config GET] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch config',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST - Create or update config
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin only' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { key, value } = body;

    console.log('[Config POST] Saving config:', key, 'Value length:', value?.length);

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Key and value are required' },
        { status: 400 }
      );
    }

    // Sanitize value if it's an API key
    const cleanValue = typeof value === 'string' ? value.trim() : value;

    const config = await SiteConfig.findOneAndUpdate(
      { key },
      { value: cleanValue, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    console.log('[Config POST] Config saved successfully:', key);

    return NextResponse.json({
      success: true,
      message: 'Config saved successfully',
      config,
    });

  } catch (error: any) {
    console.error('[Config POST] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save config',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
