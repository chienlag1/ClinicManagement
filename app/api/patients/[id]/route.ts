import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { connectMongo } from '@/lib/mongodb';
import Patient from '@/models/Patient';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Ctx) {
  try {
    await connectMongo();
    const { id } = await context.params;

    const doc = await Patient.findById(id);

    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(doc);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: Ctx) {
  try {
    const auth = getAuth(req);

    if (!auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();
    const { id } = await context.params;
    const body = await req.json();

    const data: any = {};

    if (body.name !== undefined) data.name = body.name;
    if (body.gender !== undefined) data.gender = body.gender;
    if (body.birth_date !== undefined)
      data.birth_date = new Date(body.birth_date);
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.address !== undefined) data.address = body.address;
    if (body.id_card !== undefined) data.id_card = body.id_card;

    const updated = await Patient.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updated)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];

      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: Ctx) {
  try {
    await connectMongo();
    const { id } = await context.params;

    const deleted = await Patient.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Patient deleted successfully' },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    );
  }
  const { id } = await context.params;
  const deleted = await Patient.findByIdAndDelete(id);

  if (!deleted)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ message: 'Deleted' });
}
