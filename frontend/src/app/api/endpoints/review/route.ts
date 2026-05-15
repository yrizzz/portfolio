import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { ApiEndpoint } from '@/models';

// GET - Get pending submissions for review
export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';

    const submissions = await ApiEndpoint.find({
        status: status,
      },
        createdAt: 'desc',
      },
    });

    // Parse aiAnalysis for each submission
    const submissionsWithAnalysis = submissions.map(sub => ({
      ...sub,
      aiAnalysis: sub.aiAnalysis ? JSON.parse(sub.aiAnalysis) : null,
      params: sub.params ? JSON.parse(sub.params) : [],
    }));

    return NextResponse.json({
      success: true,
      submissions: submissionsWithAnalysis,
    });

  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Approve or reject a submission
export async function PATCH(req: NextRequest) {
  await connectDB();
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, action, rejectedReason, modifications } = body;

    if (!id || !action) {
      return NextResponse.json(
        { error: 'ID and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve or reject' },
        { status: 400 }
      );
    }

    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      updatedAt: new Date(),
    };

    if (action === 'approve') {
      updateData.enabled = true;
      updateData.approvedAt = new Date();
      updateData.approvedBy = session.user.email;
      
      // Apply modifications if provided
      if (modifications) {
        if (modifications.code) updateData.code = modifications.code;
        if (modifications.name) updateData.name = modifications.name;
        if (modifications.description) updateData.description = modifications.description;
        if (modifications.path) updateData.path = modifications.path;
        if (modifications.rateLimit) updateData.rateLimit = modifications.rateLimit;
        if (modifications.requiresAuth !== undefined) updateData.requiresAuth = modifications.requiresAuth;
      }
    } else {
      updateData.enabled = false;
      updateData.rejectedReason = rejectedReason || 'No reason provided';
    }

    const endpoint = await ApiEndpoint.findByIdAndUpdate({ id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Submission ${action}ed successfully`,
      endpoint,
    });

  } catch (error: any) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: 'Failed to update submission', details: error.message },
      { status: 500 }
    );
  }
}
