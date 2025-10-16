import { NextResponse } from "next/server";

import Clinic from "@/models/Clinic";
import { connectMongo } from "@/lib/mongodb";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  await connectMongo();
  const { id } = await context.params;

  const clinic = await Clinic.findById(id);

  if (!clinic) {
    return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
  }

  return NextResponse.json(clinic);
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  await connectMongo();
  const { id } = await context.params;
  const body = await req.json();

  const updatedClinic = await Clinic.findByIdAndUpdate(id, body, {
    new: true,
  });

  if (!updatedClinic) {
    return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
  }

  return NextResponse.json(updatedClinic);
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  await connectMongo();
  const { id } = await context.params;

  const deleted = await Clinic.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Clinic deleted successfully" });
}
