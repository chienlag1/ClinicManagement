import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { connectMongo } from '@/lib/mongodb';
import Prescription from '@/models/Prescription';
import { User } from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongo();
    const { id } = await params;
    const prescription = await Prescription.findById(id).populate([
      'patient',
      'doctor',
      'medicines.medicine',
    ]);

    if (!prescription) {
      return NextResponse.json(
        { error: 'Prescription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ prescription });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuth(request);

    if (!auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();
    const { id } = await params;
    const data = await request.json();

    // Remove doctor field from update data if present (doctor should not be changed when editing)
    // The doctor is determined by who created the prescription
    const { doctor, ...updateData } = data;

    const prescription = await Prescription.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate(['patient', 'doctor', 'medicines.medicine']);

    if (!prescription) {
      return NextResponse.json(
        { error: 'Prescription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ prescription });
  } catch (error: any) {
    console.error('Error updating prescription:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongo();
    const { id } = await params;
    const prescription = await Prescription.findByIdAndDelete(id);

    if (!prescription) {
      return NextResponse.json(
        { error: 'Prescription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Prescription deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
