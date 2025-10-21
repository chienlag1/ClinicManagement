import { NextResponse } from 'next/server';

import { connectMongo } from '@/lib/mongodb';
import Clinic from '@/models/Clinic';

export async function GET() {
  try {
    await connectMongo();
    const clinics = await Clinic.find();

    return NextResponse.json(clinics, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch clinics' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectMongo();
    const body = await req.json();
    const newClinic = await Clinic.create(body);

    return NextResponse.json(newClinic, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create clinic' },
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
        { error: 'Clinic ID is required' },
        { status: 400 }
      );
    }

    const deleted = await Clinic.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Clinic deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete clinic' },
      { status: 500 }
    );
  }
}
