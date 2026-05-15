import { connectDB } from '@/lib/mongodb';
import { Experience } from \'@/models\';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();
  try {
    const { id } = await context.params;
    const experience = await Experience.findUnique({
      where: { id });
    
    if (!experience) {
      return NextResponse.json({ error: "Experience not found" }, { status: 404 });
    }
    
    return NextResponse.json(experience);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch experience" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    
    const experience = await Experience.update({
      where: { id },
      data: {
        title: body.title,
        company: body.company,
        location: body.location,
        period: body.period,
        description: body.description,
        current: body.current || false,
        order: body.order || 0,
      });

    return NextResponse.json(experience);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update experience" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    await Experience.delete({
      where: { id });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete experience" }, { status: 500 });
  }
}
