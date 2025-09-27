import { NextResponse } from "next/server";

import Medicine from "@/models/Medicine";
import { connectMongo } from "@/lib/mongodb";


export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectMongo();
  const { id } = await context.params;

  const medicine = await Medicine.findById(id);

  if (!medicine) {
    return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
  }

  return NextResponse.json(medicine);
}


export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectMongo();
  const { id } = await context.params;
  const data = await req.json();

  const updated = await Medicine.findByIdAndUpdate(id, data, { new: true });

  if (!updated) {
    return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}


export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectMongo();
  const { id } = await context.params;

  const deleted = await Medicine.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Medicine deleted" });
}
