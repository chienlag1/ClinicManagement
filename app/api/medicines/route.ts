import { NextResponse } from 'next/server';

import { connectMongo } from '@/lib/mongodb';
import Medicine from '@/models/Medicine';

export async function GET() {
  try {
    await connectMongo();
    const medicines = await Medicine.find();

    return NextResponse.json(medicines, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch medicines' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectMongo();
    const body = await req.json();
    const newMed = await Medicine.create(body);

    return NextResponse.json(newMed, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create medicine' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Medicine ID is required' },
        { status: 400 }
      );
    }

    const deleted = await Medicine.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Medicine not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Medicine deleted successfully' });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete medicine' },
      { status: 500 }
    );
  }
}
