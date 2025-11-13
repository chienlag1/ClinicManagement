import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import Prescription from '@/models/Prescription';
import Patient from '@/models/Patient';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Ctx) {
  try {
    await connectMongo();
    const { id } = await context.params;

    // Verify patient exists
    const patient = await Patient.findById(id);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Get all prescriptions for this patient
    const prescriptions = await Prescription.find({ patient: id })
      .populate('patient', 'name phone')
      .populate('doctor', 'firstName lastName email')
      .populate('medicines.medicine', 'name')
      .sort({ prescriptionDate: -1 })
      .lean();

    return NextResponse.json({ prescriptions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prescriptions' },
      { status: 500 }
    );
  }
}
