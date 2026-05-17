import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { GlobalHeader } from "@/models";

// GET - Get single global header
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const header = await GlobalHeader.findOne({
      _id: id,
      userId: session.user.email,
    }).lean();

    if (!header) {
      return NextResponse.json(
        { success: false, error: "Global header not found" },
        { status: 404 }
      );
    }

    // Convert headers (handle both Map and Object)
    let headersObj = {};
    if (header.headers) {
      if (header.headers instanceof Map) {
        headersObj = Object.fromEntries(header.headers);
      } else if (typeof header.headers === 'object') {
        headersObj = header.headers;
      }
    }

    return NextResponse.json({
      success: true,
      header: {
        ...header,
        _id: undefined, // Remove _id
        id: header._id?.toString(),
        headers: headersObj,
      },
    });
  } catch (error: any) {
    console.error("[GlobalHeader GET] Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch global header",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT - Update global header
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, service, headers, isActive } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (service !== undefined) updateData.service = service;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Parse backslashes in header values if headers provided
    if (headers !== undefined) {
      const parsedHeaders: Record<string, string> = {};
      for (const [key, value] of Object.entries(headers)) {
        if (typeof value === 'string') {
          // Replace escaped backslashes with actual backslashes
          parsedHeaders[key] = value.replace(/\\\\"/g, '\\"').replace(/\\\\/g, '\\');
        } else {
          parsedHeaders[key] = value as string;
        }
      }
      updateData.headers = parsedHeaders;
    }

    const updatedHeader = await GlobalHeader.findOneAndUpdate(
      { _id: id, userId: session.user.email },
      { $set: updateData },
      { new: true }
    );

    if (!updatedHeader) {
      return NextResponse.json(
        { success: false, error: "Global header not found" },
        { status: 404 }
      );
    }

    // Convert headers (handle both Map and Object)
    let headersObj = {};
    if (updatedHeader.headers) {
      if (updatedHeader.headers instanceof Map) {
        headersObj = Object.fromEntries(updatedHeader.headers);
      } else if (typeof updatedHeader.headers === 'object') {
        headersObj = updatedHeader.headers;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Global header updated successfully",
      header: {
        ...updatedHeader.toObject(),
        _id: undefined,
        id: updatedHeader._id.toString(),
        headers: headersObj,
      },
    });
  } catch (error: any) {
    console.error("[GlobalHeader PUT] Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update global header",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete global header
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const deletedHeader = await GlobalHeader.findOneAndDelete({
      _id: id,
      userId: session.user.email,
    });

    if (!deletedHeader) {
      return NextResponse.json(
        { success: false, error: "Global header not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Global header deleted successfully",
    });
  } catch (error: any) {
    console.error("[GlobalHeader DELETE] Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to delete global header",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
