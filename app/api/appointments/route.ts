import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectMongo } from '@/lib/mongodb';
import Patient from '@/models/Patient';
import { Appointment } from '@/models/Appointment';

export async function POST(request: Request) {
  try {
    await connectMongo();
    const body = await request.json();
    console.log('Received data:', body);

    const { isNewPatient, patientData, selectedPatientId, clinic_id, doctor_id, priority, symptoms, note } = body;

    if (!clinic_id || !doctor_id) {
      return NextResponse.json({ error: 'Thiếu phòng khám hoặc bác sĩ.' }, { status: 400 });
    }

    let patient_id;

    if (isNewPatient) {
      if (!patientData || !patientData.patient_id || !patientData.id_card || !patientData.name || !patientData.birth_date || !patientData.phone || !patientData.address) {
        return NextResponse.json({ error: 'Thiếu thông tin bệnh nhân.' }, { status: 400 });
      }

      const existingPatient = await Patient.findOne({
        $or: [
          { patient_id: patientData.patient_id },
          { id_card: patientData.id_card },
          { phone: patientData.phone },
        ],
      });
      if (existingPatient) {
        return NextResponse.json(
          { error: 'ID bệnh nhân, CMND/CCCD hoặc số điện thoại đã tồn tại.' },
          { status: 400 }
        );
      }

      const birthDate = new Date(patientData.birth_date);
      if (isNaN(birthDate.getTime())) {
        return NextResponse.json({ error: 'Ngày sinh không hợp lệ.' }, { status: 400 });
      }

      const patientDataWithDate = {
        ...patientData,
        birth_date: birthDate,
      };

      const newPatient = new Patient(patientDataWithDate);
      await newPatient.save();
      patient_id = newPatient._id;
    } else {
      if (!selectedPatientId) {
        return NextResponse.json({ error: 'Thiếu ID bệnh nhân.' }, { status: 400 });
      }
      const patientExists = await Patient.findOne({ patient_id: selectedPatientId });
      if (!patientExists) {
        return NextResponse.json({ error: 'Bệnh nhân không tồn tại' }, { status: 404 });
      }
      patient_id = patientExists._id;
    }

    const appointment = new Appointment({
      patient_id,
      clinic_id: new mongoose.Types.ObjectId(clinic_id), // Chuyển chuỗi thành ObjectId
      doctor_id: new mongoose.Types.ObjectId(doctor_id), // Chuyển chuỗi thành ObjectId
      priority: priority || false,
      symptoms: symptoms || '',
      note: note || '',
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
  try {
    await connectMongo();
    const appointments = await Appointment.find()
      .populate('patient_id', 'name')
      .populate('clinic_id', 'name address')
      .populate('doctor_id', 'name specialty')
      .lean();
    console.log('Fetched appointments:', appointments);
    return NextResponse.json(appointments, { status: 200 });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    return NextResponse.json({ error: 'Đã có lỗi xảy ra' }, { status: 500 });
  }
}