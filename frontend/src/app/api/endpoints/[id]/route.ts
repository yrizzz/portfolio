import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/mongodb';
import { ApiEndpoint } from '@/models';
import { auth } from "@/lib/auth";

// GET - Get single endpoint
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    console.log('[API GET] Received ID:', id);

    if (!id || id === 'undefined') {
      return NextResponse.json({ 
        success: false,
        error: "Invalid endpoint ID" 
      }, { status: 400 });
    }

    const endpoint = await ApiEndpoint.findOne({ _id: id }).lean();

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
    }

    // Parse JSON fields
    const endpointWithParsed = {
      ...endpoint,
      id: endpoint._id?.toString(),
      params: endpoint.params ? JSON.parse(endpoint.params as string) : [],
      aiAnalysis: endpoint.aiAnalysis ? JSON.parse(endpoint.aiAnalysis as string) : null,
    };

    return NextResponse.json({
      success: true,
      endpoint: endpointWithParsed,
    });
  } catch (error) {
    console.error("Error fetching endpoint:", error);
    return NextResponse.json(
      { error: "Failed to fetch endpoint" },
      { status: 500 }
    );
  }
}

// PUT - Update endpoint
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const { 
      name, 
      description, 
      method, 
      path, 
      language, 
      code,
      category,
      params: apiParams,
      exampleCode,
      enabled, 
      status,
      requiresAuth,
      rateLimit,
      order 
    } = body;

    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (method !== undefined) updateData.method = method.toUpperCase();
    if (path !== undefined) updateData.path = path;
    if (language !== undefined) updateData.language = language.toLowerCase();
    if (code !== undefined) {
      updateData.code = code;
      updateData.rawScript = code;
    }
    if (category !== undefined) updateData.category = category;
    if (apiParams !== undefined) updateData.params = JSON.stringify(apiParams);
    if (exampleCode !== undefined) updateData.exampleCode = exampleCode;
    if (enabled !== undefined) updateData.enabled = enabled;
    if (status !== undefined) updateData.status = status;
    if (requiresAuth !== undefined) updateData.requiresAuth = requiresAuth;
    if (rateLimit !== undefined) updateData.rateLimit = rateLimit;
    if (order !== undefined) updateData.order = order;
    
    updateData.updatedAt = new Date();

    const endpoint = await ApiEndpoint.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Endpoint updated successfully',
      endpoint,
    });
  } catch (error) {
    console.error("Error updating endpoint:", error);
    return NextResponse.json(
      { error: "Failed to update endpoint" },
      { status: 500 }
    );
  }
}

// DELETE - Delete endpoint
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await ApiEndpoint.findByIdAndDelete(id);

    return NextResponse.json({ 
      success: true,
      message: "Endpoint deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting endpoint:", error);
    return NextResponse.json(
      { error: "Failed to delete endpoint" },
      { status: 500 }
    );
  }
}
