import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import Bill from '@/models/Bill';
import Patient from '@/models/Patient';

type Ctx = { params: Promise<{ id: string }> };

// GET /api/patients/[id]/bills
export async function GET(req: NextRequest, context: Ctx) {
  try {
    await connectMongo();
    const { id } = await context.params;

    // Verify patient exists
    const patient = await Patient.findById(id);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Get all bills for this patient
    const bills = await Bill.find({ patient: id })
      .populate('prescription', 'prescriptionCode')
      .populate('appointment', 'appointment_id')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ bills }, { status: 200 });
  } catch (error) {
    console.error('Error fetching patient bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}
