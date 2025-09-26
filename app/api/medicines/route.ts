import { NextResponse } from "next/server";

import { connectMongo } from "@/lib/mongodb";
import Medicine from "@/models/Medicine";


export async function GET() {
  try {
    await connectMongo();
    const medicines = await Medicine.find();

    return NextResponse.json(medicines, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch medicines" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectMongo();
    const body = await req.json();
    const newMed = await Medicine.create(body);

    return NextResponse.json(newMed, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create medicine" },
      { status: 500 },
    );
  }
}
