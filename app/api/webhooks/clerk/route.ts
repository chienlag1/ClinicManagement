import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;
  const payload = await req.text();
  const headerList = await headers();

  const svixId = headerList.get("svix-id") as string;
  const svixTimestamp = headerList.get("svix-timestamp") as string;
  const svixSignature = headerList.get("svix-signature") as string;

  if (!svixId || !svixTimestamp || !svixSignature) {
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
  } catch (err) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const eventType = evt.type as string;
  const data = evt.data;

  await connectMongo();

  if (eventType === "user.created" || eventType === "user.updated") {
    const clerkUserId = data.id as string;
    const email = data.email_addresses?.[0]?.email_address as
      | string
      | undefined;
    const firstName = data.first_name as string | undefined;
    const lastName = data.last_name as string | undefined;
    const imageUrl = data.image_url as string | undefined;
    // Debug: log toàn bộ data và role
    console.log("[Clerk Webhook] data:", JSON.stringify(data, null, 2));
    const role = data.public_metadata?.role || "user";
    console.log("[Clerk Webhook] role:", role);

    await User.findOneAndUpdate(
      { clerkUserId },
      { $set: { email, firstName, lastName, imageUrl, role } },
      { upsert: true, new: true }
    );
  }

  if (eventType === "user.deleted") {
    const clerkUserId = data.id as string;
    await User.findOneAndDelete({ clerkUserId });
  }

  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
