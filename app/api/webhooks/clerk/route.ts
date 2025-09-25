import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { connectMongo } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

  if (!WEBHOOK_SECRET) {
    // console.error("[Clerk Webhook] WEBHOOK_SECRET is not configured");

    return new NextResponse("Webhook secret not configured", { status: 500 });
  }

  const payload = await req.text();
  const headerList = await headers();

  const svixId = headerList.get("svix-id") as string;
  const svixTimestamp = headerList.get("svix-timestamp") as string;
  const svixSignature = headerList.get("svix-signature") as string;

  // console.log("[Clerk Webhook] Headers:", {
  //   svixId,
  //   svixTimestamp,
  //   svixSignature: svixSignature ? "present" : "missing",
  // });

  if (!svixId || !svixTimestamp || !svixSignature) {
    // console.error("[Clerk Webhook] Missing svix headers");

    return new NextResponse("Missing svix headers", { status: 400 });
  }

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  try {
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch {
    // console.error("[Clerk Webhook] Invalid signature:", err);

    return new NextResponse("Invalid signature", { status: 400 });
  }

  const eventType = evt.type as string;
  const data = evt.data;

  // console.log("[Clerk Webhook] Event type:", eventType);
  // console.log("[Clerk Webhook] Event data:", JSON.stringify(data, null, 2));

  await connectMongo();

  if (eventType === "user.created" || eventType === "user.updated") {
    const clerkUserId = data.id as string;
    const email = data.email_addresses?.[0]?.email_address as
      | string
      | undefined;
    const firstName = data.first_name as string | undefined;
    const lastName = data.last_name as string | undefined;
    const imageUrl = data.image_url as string | undefined;

    // Lấy role từ public_metadata
    const role = data.public_metadata?.role || "user";

    // console.log("[Clerk Webhook] Processing user:", {
    //   clerkUserId,
    //   email,
    //   firstName,
    //   lastName,
    //   role,
    //   publicMetadata: data.public_metadata,
    // });

    try {
      await User.findOneAndUpdate(
        { clerkUserId },
        { $set: { email, firstName, lastName, imageUrl, role } },
        { upsert: true, new: true },
      );

      // console.log("[Clerk Webhook] User updated successfully:", {
      //   userId: updatedUser._id,
      //   clerkUserId: updatedUser.clerkUserId,
      //   role: updatedUser.role,
      // });
    } catch {
      // console.error("[Clerk Webhook] Error updating user:", error);

      return new NextResponse("Database error", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const clerkUserId = data.id as string;

    // console.log("[Clerk Webhook] Deleting user:", clerkUserId);

    try {
      await User.findOneAndDelete({ clerkUserId });
      // console.log("[Clerk Webhook] User deleted successfully");
    } catch {
      // console.error("[Clerk Webhook] Error deleting user:", error);

      return new NextResponse("Database error", { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
