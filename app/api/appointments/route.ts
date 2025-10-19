import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import Appointment from '@/models/Appointment'; // Sửa import default

const USE_MOCK = true; // Sử dụng mock tạm thời theo yêu cầu leader

export async function POST(request: Request) {
  try {
    if (USE_MOCK) {
      const body = await request.json();
      console.log('Mock received data:', body);
      return NextResponse.json({ message: 'Đặt lịch thành công (mock)', appointment: body }, { status: 201 });
    }

    await connectMongo();
    const body = await request.json();
    console.log('Received data:', body);

    const { isNewPatient, patientData, selectedPatientId, clinic_id, doctor_id, priority, symptoms, note } = body;

    if (!doctor_id) { // Chỉ kiểm tra doctor_id vì mock dùng doctorId
      return NextResponse.json({ error: 'Thiếu bác sĩ.' }, { status: 400 });
    }

    const appointment = new Appointment({
      doctorId: doctor_id, // Sử dụng doctorId string
      patientId: isNewPatient ? patientData?.patient_id : selectedPatientId, // Sử dụng patientId string
      time: new Date(), // Thêm time mặc định
      type: 'Consultation', // Giá trị mặc định
      notes: note || '', // Gộp symptoms và note vào notes
      priority: priority || false,
    });

    await appointment.save();
    return NextResponse.json(
      { message: 'Đặt lịch thành công', appointment },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in POST /api/appointments:', errorMessage);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (USE_MOCK) {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const mockAppointments = [
      { id: '1', date: today, time: '08:30 AM - 09:00 AM', type: 'Checkup', notes: 'General health check', patient: 'John Doe' },
      { id: '2', date: today, time: '09:15 AM - 09:45 AM', type: 'Follow-up', notes: 'Review blood test results', patient: 'Jane Smith' },
      { id: '3', date: tomorrow, time: '10:00 AM - 10:30 AM', type: 'Consultation', notes: '', patient: 'Alice Johnson' },
    ];
    return NextResponse.json(mockAppointments);
  }

  try {
    await connectMongo();
    const appointments = await Appointment.find().lean();
    console.log('Fetched appointments:', appointments);
    return NextResponse.json(appointments, { status: 200 });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    return NextResponse.json({ error: 'Đã có lỗi xảy ra' }, { status: 500 });
  }
}