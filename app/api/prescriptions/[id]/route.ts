// app/api/prescriptions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { connectMongo } from '@/lib/mongodb';
import Prescription from '@/models/Prescription';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: Ctx) {
  try {
    await connectMongo();
    const { id } = await context.params; // await ở đây
    const prescription = await Prescription.findById(id).populate([
      'patient',
      'doctor',
      'medicines.medicine',
    ]);

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    return NextResponse.json({ prescription });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: Ctx) {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();
    const { id } = await context.params; // await ở đây
    const data = await req.json();

    const { doctor, ...updateData } = data;

    const prescription = await Prescription.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate(['patient', 'doctor', 'medicines.medicine']);

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    return NextResponse.json({ prescription });
  } catch (error: any) {
    console.error('Error updating prescription:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: Ctx) {
  try {
    await connectMongo();
    const { id } = await context.params; // await ở đây
    const prescription = await Prescription.findByIdAndDelete(id);

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Prescription deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}