import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { GlobalHeader } from "@/models";

// GET - List all global headers for current user
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');
    const isActive = searchParams.get('isActive');

    const query: any = { userId: session.user.email };
    if (service) query.service = service;
    if (isActive !== null) query.isActive = isActive === 'true';

    const headers = await GlobalHeader.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Convert Map to Object for JSON serialization
    const headersWithParsed = headers.map((header: any) => {
      let headersObj = {};
      
      if (header.headers) {
        // Check if it's a Map or already an Object
        if (header.headers instanceof Map) {
          headersObj = Object.fromEntries(header.headers);
        } else if (typeof header.headers === 'object') {
          headersObj = header.headers;
        }
      }
      
      return {
        ...header,
        _id: undefined, // Remove _id
        id: header._id?.toString(),
        headers: headersObj,
      };
    });

    return NextResponse.json({
      success: true,
      headers: headersWithParsed,
    });
  } catch (error: any) {
    console.error("[GlobalHeaders GET] Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch global headers",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST - Create new global header
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, service, headers, isActive } = body;

    if (!name || !service || !headers) {
      return NextResponse.json(
        { 
          success: false,
          error: "Name, service, and headers are required"
        },
        { status: 400 }
      );
    }

    // Validate service
    const validServices = ['instagram', 'tiktok', 'twitter', 'facebook', 'youtube', 'custom'];
    if (!validServices.includes(service)) {
      return NextResponse.json(
        { 
          success: false,
          error: `Invalid service. Must be one of: ${validServices.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Parse backslashes in header values
    const parsedHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (typeof value === 'string') {
        // Replace escaped backslashes with actual backslashes
        parsedHeaders[key] = value.replace(/\\\\"/g, '\\"').replace(/\\\\/g, '\\');
      } else {
        parsedHeaders[key] = value as string;
      }
    }

    const newHeader = await GlobalHeader.create({
      userId: session.user.email,
      name,
      description,
      service,
      headers: parsedHeaders, // Store parsed headers
      isActive: isActive !== undefined ? isActive : true,
    });

    // Convert headers (handle both Map and Object)
    let headersObj = {};
    if (newHeader.headers) {
      if (newHeader.headers instanceof Map) {
        headersObj = Object.fromEntries(newHeader.headers);
      } else if (typeof newHeader.headers === 'object') {
        headersObj = newHeader.headers;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Global header created successfully",
      header: {
        ...newHeader.toObject(),
        _id: undefined,
        id: newHeader._id.toString(),
        headers: headersObj,
      },
    });
  } catch (error: any) {
    console.error("[GlobalHeaders POST] Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create global header",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
