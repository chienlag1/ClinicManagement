import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import Medicine from "@/models/Medicine";


export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    await Medicine.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Medicine deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete medicine" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    const body = await req.json();

    const updated = await Medicine.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true } 
    );

    if (!updated) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update medicine" }, { status: 500 });
  }
}
