import { connectDB } from '@/lib/mongodb';
import { User } from '@/models';
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST() {
  await connectDB();
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user exists
    let user = await User.findOne({ email: session.user.email }).lean();

    // Create user if doesn't exist
    if (!user) {
      user = await User.create({
        email: session.user.email,
        name: session.user.name || null,
        image: session.user.image || null,
        role: "USER",
      });
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
