import { NextResponse } from 'next/server';

import { connectMongo } from '@/lib/mongodb';
import Appointment from '@/models/Appointment';

// GET /api/appointments/[doctorId]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  try {
    await connectMongo();

    const { doctorId } = await params;

    // Lấy appointments theo doctor_id
    const appointments = await Appointment.find({ doctor_id: doctorId })
      .populate('patient_id', 'patient_id name phone')
      .sort({ appointment_date: 1, appointment_time: 1 });

    return NextResponse.json(appointments, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
