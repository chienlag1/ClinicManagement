import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import { logger } from '@/lib/logger';
import Appointment from '@/models/Appointment';
import Patient from '@/models/Patient';

export async function POST(request: Request) {
  try {
    await connectMongo();
    const body = await request.json();
    const {
      isNewPatient,
      patientData,
      selectedPatientId,
      clinic_id,
      doctor_id,
      appointment_date,
      appointment_time,
      priority,
      symptoms,
      note,
      created_by = 'staff', // Mặc định là staff
    } = body;

    // Validation
    if (!clinic_id || !doctor_id || !appointment_date || !appointment_time) {
      console.log('Missing required fields');
      return NextResponse.json(
        {
          error:
            'Thiếu thông tin bắt buộc: phòng khám, bác sĩ, ngày và giờ hẹn.',
        },
        { status: 400 }
      );
    }

    if (!symptoms || symptoms.trim().length === 0) {
      console.log('Missing symptoms');
      return NextResponse.json(
        {
          error: 'Vui lòng mô tả triệu chứng.',
        },
        { status: 400 }
      );
    }

    let patientId;

    // Xử lý bệnh nhân
    if (isNewPatient) {
      console.log('Creating new patient');
      if (!patientData || !patientData.patient_id || !patientData.name) {
        return NextResponse.json(
          {
            error: 'Thiếu thông tin bệnh nhân mới.',
          },
          { status: 400 }
        );
      }

      // Tạo bệnh nhân mới
      const newPatient = new Patient({
        patient_id: patientData.patient_id,
        id_card: patientData.id_card,
        name: patientData.name,
        gender: patientData.gender,
        birth_date: new Date(patientData.birth_date),
        phone: patientData.phone,
        address: patientData.address,
      });

      await newPatient.save();
      patientId = newPatient._id;
      console.log('New patient created:', patientId);
    } else {
      console.log('Using existing patient:', selectedPatientId);
      if (!selectedPatientId) {
        return NextResponse.json(
          {
            error: 'Vui lòng chọn bệnh nhân.',
          },
          { status: 400 }
        );
      }

      // Kiểm tra patient có tồn tại không
      const patient = await Patient.findById(selectedPatientId);
      if (!patient) {
        console.log('Patient not found:', selectedPatientId);
        return NextResponse.json(
          {
            error: 'Không tìm thấy bệnh nhân.',
          },
          { status: 404 }
        );
      }

      patientId = selectedPatientId;
      console.log('Patient found:', patientId);
    }

    // Kiểm tra xung đột lịch hẹn
    console.log('Checking for conflicts...');
    const existingAppointment = await Appointment.findOne({
      doctor_id: doctor_id,
      appointment_date: new Date(appointment_date),
      appointment_time,
      status: { $in: ['scheduled', 'confirmed'] },
    });

    if (existingAppointment) {
      console.log('Conflict found');
      return NextResponse.json(
        {
          error: 'Bác sĩ đã có lịch hẹn vào thời gian này.',
        },
        { status: 409 }
      );
    }

    // Tạo lịch hẹn mới
    console.log('Creating appointment...');

    const appointment = new Appointment({
      patient_id: patientId,
      clinic_id: clinic_id,
      doctor_id: doctor_id,
      appointment_date: new Date(appointment_date),
      appointment_time,
      priority: priority || false,
      symptoms: symptoms.trim(),
      notes: note?.trim() || '',
      created_by,
    });

    await appointment.save();
    console.log('Appointment created:', appointment._id);

    // Populate thông tin để trả về
    const populatedAppointment = await Appointment.findById(
      appointment._id
    ).populate('patient_id', 'patient_id name phone');

    console.log('Appointment populated successfully');
    return NextResponse.json(
      {
        message: 'Đặt lịch thành công!',
        appointment: populatedAppointment,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in POST /api/appointments:', errorMessage);
    console.error('Full error:', error);

    // Xử lý lỗi duplicate
    if (errorMessage.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Thông tin bệnh nhân đã tồn tại trong hệ thống.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi đặt lịch.', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectMongo();

    // Lấy dữ liệu thực từ database
    const appointments = await Appointment.find()
      .populate('patient_id', 'patient_id name phone')
      .sort({ createdAt: -1 });

    console.log('Returning real appointments:', appointments.length);
    return NextResponse.json(appointments, { status: 200 });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi lấy danh sách lịch hẹn' },
      { status: 500 }
    );
  }
}
