import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectMongo();
    const readyState = mongoose.connection.readyState; // 1 = connected
    return NextResponse.json({ connected: readyState === 1, readyState });
  } catch (error: unknown) {
    return NextResponse.json(
      { connected: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
