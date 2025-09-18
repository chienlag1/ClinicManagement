import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectMongo } from "@/lib/mongodb";
import { User } from "@/models/User";

export function withRole(roles: string[]) {
  return async function roleMiddleware(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect("/sign-in");
    }
    await connectMongo();
    const user = await User.findOne({ clerkUserId: userId });
    if (!user || !roles.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  };
}
