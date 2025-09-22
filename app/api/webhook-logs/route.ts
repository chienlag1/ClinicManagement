import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { connectMongo } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();

    // Lấy thông tin user từ database
    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found in database",
          suggestion: "Try syncing your role first",
        },
        { status: 404 },
      );
    }

    // Lấy thông tin từ Clerk
    const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!clerkUser.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user from Clerk" },
        { status: 400 },
      );
    }

    const clerkData = await clerkUser.json();
    const clerkRole = clerkData.public_metadata?.role || "user";

    return NextResponse.json({
      user: {
        clerkUserId: user.clerkUserId,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      clerk: {
        id: clerkData.id,
        email: clerkData.email_addresses?.[0]?.email_address,
        publicMetadata: clerkData.public_metadata,
        role: clerkRole,
        createdAt: clerkData.created_at,
        updatedAt: clerkData.updated_at,
      },
      syncStatus: {
        isSynced: user.role === clerkRole,
        needsSync: user.role !== clerkRole,
      },
      webhookInfo: {
        webhookSecretConfigured: !!process.env.CLERK_WEBHOOK_SECRET,
        webhookUrl: "/api/webhooks/clerk",
      },
    });
  } catch {
    // Error fetching webhook logs

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
