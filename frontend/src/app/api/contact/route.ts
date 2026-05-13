import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Save to database
    const contact = await prisma.contact.create({
      data: {
        name: body.name,
        email: body.email,
        subject: body.subject || null,
        message: body.message,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Message sent successfully",
      id: contact.id 
    });
  } catch (error) {
    console.error("Error saving contact:", error);
    return NextResponse.json({ 
      error: "Failed to send message" 
    }, { status: 500 });
  }
}

// GET all contacts (admin only)
export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(contacts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}
