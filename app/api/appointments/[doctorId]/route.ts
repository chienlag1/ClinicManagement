// app/api/appointments/[doctorId]/route.ts
import { NextResponse } from 'next/server';
import Appointment from '@/models/Appointment';
import { connectMongo } from '@/lib/mongodb';

const USE_MOCK = true;

export async function GET(
  req: Request,
  ctx: { params: Promise<{ doctorId: string }> }
) {
  if (USE_MOCK) {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const mockAppointments = [
      {
        id: '1',
        date: today,
        time: '08:30 AM - 09:00 AM',
        type: 'Checkup',
        notes: 'General health check',
        patient: 'John Doe',
      },
      {
        id: '2',
        date: today,
        time: '09:15 AM - 09:45 AM',
        type: 'Follow-up',
        notes: 'Review blood test results',
        patient: 'Jane Smith',
      },
      {
        id: '3',
        date: tomorrow,
        time: '10:00 AM - 10:30 AM',
        type: 'Consultation',
        notes: '',
        patient: 'Alice Johnson',
      },
    ];
    return NextResponse.json(mockAppointments);
  }

  await connectMongo();
  const { doctorId } = await ctx.params;
  const appointments = await Appointment.find({ doctorId }).populate('patientId');

  const formatted = appointments.map(a => ({
    id: a._id,
    date: new Date(a.time).toISOString().split('T')[0],
    time: new Date(a.time).toLocaleTimeString(),
    type: a.type,
    notes: a.notes,
    patient: (a.patientId as any)?.name || 'Unknown',
  }));

  return NextResponse.json(formatted);
}
