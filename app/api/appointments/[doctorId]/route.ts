// app/api/appointments/[doctorId]/route.ts
import { NextResponse } from 'next/server';
import Appointment from '@/models/Appointment';
import { connectMongo } from '@/lib/mongodb';
import Patient from '@/models/Patient';

const USE_MOCK = true; // bật chế độ mock

export async function GET(
  req: Request,
  ctx: { params: Promise<{ doctorId: string }> }
) {
  if (USE_MOCK) {
    // Mock data
    const mockAppointments = [
      {
        id: '1',
        time: '08:30 AM - 09:00 AM',
        type: 'Checkup',
        notes: 'General health check',
        patient: 'John Doe',
      },
      {
        id: '2',
        time: '09:15 AM - 09:45 AM',
        type: 'Follow-up',
        notes: 'Review blood test results',
        patient: 'Jane Smith',
      },
      {
        id: '3',
        time: '10:00 AM - 10:30 AM',
        type: 'Consultation',
        notes: '',
        patient: 'Alice Johnson',
      },
    ];
    return NextResponse.json(mockAppointments);
  }

  // Kết nối MongoDB
  await connectMongo();

  const { doctorId } = await ctx.params;

  // Lấy appointments thật
  const appointments = await Appointment.find({ doctorId }).populate('patientId');

  const formatted = appointments.map(a => ({
    id: a._id,
    time: a.time,
    type: a.type,
    notes: a.notes,
    patient: (a.patientId as any)?.name || 'Unknown',
  }));

  return NextResponse.json(formatted);
}
