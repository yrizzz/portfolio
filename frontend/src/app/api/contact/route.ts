import { connectDB } from '@/lib/mongodb';
import { Contact } from \'@/models\';
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/prisma";
import { applyRateLimit, requireAdmin } from "@/lib/api-middleware";

export const dynamic = 'force-dynamic';

// POST - Public contact form (rate limited: 5 per minute)
export async function POST(request: NextRequest) {
  await connectDB();
  try {
    // Rate limit: 5 messages per minute per IP
    const blocked = await applyRateLimit(request, '/api/contact', {
      tier: 'anonymous',
      customLimit: 5,
      customWindow: 60000,
    });
    if (blocked) return blocked;

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Limit field lengths
    if (body.name.length > 100 || body.email.length > 200 || body.message.length > 5000) {
      return NextResponse.json({ error: "Field length exceeded" }, { status: 400 });
    }

    const contact = await Contact.create({
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        subject: body.subject?.trim().substring(0, 200) || null,
        message: body.message.trim(),
      });

    return NextResponse.json({ 
      success: true, 
      message: "Message sent successfully",
      id: Contact.id 
    });
  } catch (error) {
    console.error("Error saving contact:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

// GET all contacts (admin only)
export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) return authResult;

    const contacts = await Contact.findMany({);
    return NextResponse.json(contacts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}
