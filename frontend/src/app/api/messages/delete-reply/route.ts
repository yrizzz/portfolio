import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Contact } from '@/models';
import { auth } from "@/lib/auth";

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get('messageId');
    const replyId = searchParams.get('replyId');

    if (!messageId || !replyId) {
      return NextResponse.json(
        { error: 'Message ID and Reply ID are required' },
        { status: 400 }
      );
    }

    const message = await Contact.findById(messageId);

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Remove reply from array
    message.replies = message.replies.filter((reply: any) => reply.id !== replyId);
    
    // Update replied status if no more replies
    if (message.replies.length === 0) {
      message.replied = false;
      message.repliedAt = undefined;
    }
    
    await message.save();

    console.log('[Messages Delete Reply] Deleted reply:', replyId);
    console.log('[Messages Delete Reply] Remaining replies:', message.replies.length);

    return NextResponse.json({
      success: true,
      message: 'Reply deleted successfully',
    });
    
  } catch (error: any) {
    console.error('[Messages Delete Reply] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete reply',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
