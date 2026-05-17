import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Contact } from '@/models';
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, replyMessage } = await req.json();

    if (!id || !replyMessage) {
      return NextResponse.json(
        { error: 'Message ID and reply message are required' },
        { status: 400 }
      );
    }

    const message = await Contact.findById(id);

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Add admin reply to replies array
    const adminReply = {
      id: `reply-${Date.now()}`,
      name: session.user.name || 'Admin',
      email: session.user.email || '',
      message: replyMessage,
      createdAt: new Date(),
      isAdmin: true,
    };

    message.replies = message.replies || [];
    message.replies.push(adminReply);
    message.replied = true;
    message.repliedAt = new Date();
    message.read = true;
    
    console.log('[Messages Reply] Saving reply:', adminReply);
    console.log('[Messages Reply] Total replies:', message.replies.length);
    
    await message.save();
    
    console.log('[Messages Reply] Saved successfully');

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully',
    });
    
  } catch (error: any) {
    console.error('[Messages Reply] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send reply',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
