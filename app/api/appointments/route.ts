import { NextResponse } from 'next/server';

import { connectMongo } from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import Patient from '@/models/Patient';

// const USE_MOCK = false; // Tắt mock để sử dụng database thực

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
      return NextResponse.json(
        {
          error:
            'Thiếu thông tin bắt buộc: phòng khám, bác sĩ, ngày và giờ hẹn.',
        },
        { status: 400 }
      );
    }

    if (!symptoms || symptoms.trim().length === 0) {
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
    } else {
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
        return NextResponse.json(
          {
            error: 'Không tìm thấy bệnh nhân.',
          },
          { status: 404 }
        );
      }

      patientId = selectedPatientId;
    }

    // Kiểm tra xung đột lịch hẹn
    const existingAppointment = await Appointment.findOne({
      doctor_id: doctor_id,
      appointment_date: new Date(appointment_date),
      appointment_time,
      status: { $in: ['scheduled', 'confirmed'] },
    });

    if (existingAppointment) {
      return NextResponse.json(
        {
          error: 'Bác sĩ đã có lịch hẹn vào thời gian này.',
        },
        { status: 409 }
      );
    }

    // Tạo lịch hẹn mới

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

    // Populate thông tin để trả về
    const populatedAppointment = await Appointment.findById(
      appointment._id
    ).populate('patient_id', 'patient_id name phone');

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

    return NextResponse.json(appointments, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi lấy danh sách lịch hẹn' },
      { status: 500 }
    );
  }
}
