import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ApiEndpoint } from "@/models/ApiEndpoint";
import { ApiRequest } from "@/models/ApiRequest";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const category = searchParams.get("category");
    const method = searchParams.get("method");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    const whereClause: any = {
      status: "approved",
      enabled: true,
    };

    if (category && category !== "all") {
      whereClause.category = category;
    }

    if (method && method !== "all") {
      whereClause.method = method;
    }

    if (search) {
      whereClause.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { path: { $regex: search, $options: "i" } },
      ];
    }

    const [endpoints, total] = await Promise.all([
      ApiEndpoint.find(whereClause)
        .select("-rawScript -code -aiAnalysis")
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ApiEndpoint.countDocuments(whereClause),
    ]);

    // get categories
    const categoriesRaw = await ApiEndpoint.aggregate([
      { $match: { status: "approved", enabled: true, category: { $ne: null } } },
      { $group: { _id: "$category" } }
    ]);
    const categories = categoriesRaw.map(c => c._id).filter(Boolean);

    // Get traffic stats for these endpoints
    const endpointsWithTraffic = await Promise.all(
      endpoints.map(async (ep: any) => {
        const trafficCount = await ApiRequest.countDocuments({
          endpoint: { $regex: `^${ep.path}` }
        });
        
        return {
          ...ep,
          id: ep._id.toString(),
          traffic: trafficCount
        };
      })
    );

    return NextResponse.json({
      endpoints: endpointsWithTraffic,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      categories
    });
  } catch (error) {
    console.error("Failed to fetch public APIs:", error);
    return NextResponse.json({ error: "Failed to fetch public APIs" }, { status: 500 });
  }
}
