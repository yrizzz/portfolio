import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ApiEndpoint } from "@/models/ApiEndpoint";
import { ApiRequest } from "@/models/ApiRequest";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const params = await props.params;
    const { id } = params;

    const endpoint = await ApiEndpoint.findOne({
      _id: id,
      status: "approved",
      enabled: true,
    }).select("-rawScript -code -aiAnalysis").lean();

    if (!endpoint) {
      return NextResponse.json({ error: "API not found" }, { status: 404 });
    }

    // Traffic count
    const trafficCount = await ApiRequest.countDocuments({
      endpoint: { $regex: `^${endpoint.path}` }
    });

    return NextResponse.json({
      endpoint: {
        ...endpoint,
        id: endpoint._id.toString(),
        traffic: trafficCount,
      },
    });
  } catch (error) {
    console.error("Failed to fetch API details:", error);
    return NextResponse.json({ error: "Failed to fetch API details" }, { status: 500 });
  }
}
