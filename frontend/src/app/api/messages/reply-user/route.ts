import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Contact } from '@/models';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { messageId, name, email, message } = await req.json();

    if (!messageId || !name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Find parent message
    const parentMessage = await Contact.findById(messageId);
    
    if (!parentMessage) {
      return NextResponse.json(
        { error: 'Parent message not found' },
        { status: 404 }
      );
    }

    // Add reply to parent message
    const reply = {
      id: `reply-${Date.now()}`,
      name,
      email,
      message,
      createdAt: new Date(),
      isAdmin: false,
    };

    parentMessage.replies = parentMessage.replies || [];
    parentMessage.replies.push(reply);
    
    console.log('[Messages Reply User] Saving reply:', reply);
    console.log('[Messages Reply User] Total replies:', parentMessage.replies.length);
    
    await parentMessage.save();
    
    console.log('[Messages Reply User] Saved successfully');

    return NextResponse.json({
      success: true,
      message: 'Reply added successfully',
    });
    
  } catch (error: any) {
    console.error('[Messages Reply User] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add reply',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
