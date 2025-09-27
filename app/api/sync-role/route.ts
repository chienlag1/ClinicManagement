import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { connectMongo } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();

    // Lấy thông tin user từ Clerk
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
    const role = clerkData.public_metadata?.role || "user";

    // Syncing user role from Clerk metadata

    // Cập nhật role trong database
    const updatedUser = await User.findOneAndUpdate(
      { clerkUserId: userId },
      { $set: { role } },
      { upsert: true, new: true },
    );

    return NextResponse.json({
      success: true,
      role: updatedUser.role,
      message: "Role synced successfully",
    });
  } catch {
    // Error syncing role - return error response

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();

    // Lấy thông tin user từ Clerk
    const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!clerkUser.ok) {
      // Clerk API error - return error response

      return NextResponse.json(
        { error: "Failed to fetch user from Clerk" },
        { status: 400 },
      );
    }

    const clerkData = await clerkUser.json();
    const clerkRole = clerkData.public_metadata?.role || "user";

    // Clerk data retrieved successfully

    // Lấy role từ database
    const dbUser = await User.findOne({ clerkUserId: userId });
    const dbRole = dbUser?.role || "user";

    // Database data retrieved successfully

    return NextResponse.json({
      clerkRole,
      dbRole,
      isSynced: clerkRole === dbRole,
      publicMetadata: clerkData.public_metadata,
      userExists: !!dbUser,
    });
  } catch {
    // Error syncing role - return error response

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
