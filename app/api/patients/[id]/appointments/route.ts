import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
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

    // Get all appointments for this patient
    const appointments = await Appointment.find({ patient_id: id })
      .populate('patient_id', 'name phone')
      .sort({ appointment_date: -1, appointment_time: -1 })
      .lean();

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
