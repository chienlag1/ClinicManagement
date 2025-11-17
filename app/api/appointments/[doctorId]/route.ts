import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import mongoose from 'mongoose';
import Appointment from '@/models/Appointment';
import Patient from '@/models/Patient';
import { User } from '@/models/User';

// GET /api/appointments/[doctorId]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  try {
    // IMPORTANT: Import/register models BEFORE connecting to MongoDB
    // This ensures models are registered in mongoose.models before any queries
    // In Next.js, models need to be explicitly registered due to hot reload

    // Force model registration by accessing them
    // This triggers the model registration in their respective files
    void Appointment; // Triggers Appointment model registration
    void Patient; // Triggers Patient model registration

    // Now connect to MongoDB
    await connectMongo();

    const { doctorId } = await params;

    // Log available models for debugging
    const availableModels = Object.keys(mongoose.models);
    console.log('Available Mongoose models:', availableModels);

    // Verify and ensure Patient model is registered
    if (!mongoose.models.Patient) {
      console.warn('Patient model not found, attempting to register...');
      // Try to import Patient model again
      const PatientModel = Patient;
      if (!mongoose.models.Patient) {
        console.error(
          'Patient model still not registered. Available models:',
          availableModels
        );
        throw new Error('Patient model could not be registered');
      }
    }

    // Verify Appointment model is registered
    if (!mongoose.models.Appointment) {
      console.error(
        'Appointment model not registered. Available models:',
        availableModels
      );
      throw new Error('Appointment model could not be registered');
    }

    // Use the registered model from mongoose.models
    const PatientModel = mongoose.models.Patient;

    // Lấy appointments theo doctor_id
    // doctorId có thể là:
    // 1. clerkUserId (string) - từ user.id
    // 2. User._id (ObjectId) - từ appointments cũ được tạo bằng doctor._id

    console.log(`API - Fetching appointments for doctorId: ${doctorId}`);
    console.log(`API - doctorId type: ${typeof doctorId}`);

    // Tìm User trong database để lấy cả _id và clerkUserId
    const user = await User.findOne({ clerkUserId: doctorId }).select(
      '_id clerkUserId'
    );
    const userId = user?._id;
    const userClerkId = user?.clerkUserId || doctorId;

    console.log('API - User found:', {
      userId: userId?.toString(),
      clerkUserId: userClerkId,
      doctorId: doctorId,
    });

    // Tìm appointments với doctor_id khớp:
    // 1. clerkUserId (string) - từ appointments mới
    // 2. User._id (ObjectId) - từ appointments cũ
    const query: any = {
      $or: [
        { doctor_id: doctorId }, // clerkUserId (string)
        { doctor_id: String(doctorId) }, // string comparison
      ],
    };

    // Nếu tìm thấy User, thêm User._id vào query
    if (userId) {
      query.$or.push(
        { doctor_id: userId }, // User._id (ObjectId)
        { doctor_id: userId.toString() } // User._id (string)
      );
    }

    console.log('API - Query:', JSON.stringify(query, null, 2));

    const appointments = await Appointment.find(query)
      .populate({
        path: 'patient_id',
        select: 'patient_id name phone',
        model: PatientModel, // Use the verified registered model
      })
      .sort({ appointment_date: 1, appointment_time: 1 });

    console.log(
      `API - Found ${appointments.length} appointments for doctor ${doctorId}`
    );

    // Debug: Log chi tiết từng appointment
    if (appointments.length > 0) {
      appointments.forEach((apt: any, index: number) => {
        const aptDate = apt.appointment_date
          ? new Date(apt.appointment_date)
          : null;
        const aptDateStr =
          aptDate && !isNaN(aptDate.getTime())
            ? aptDate.toISOString().split('T')[0]
            : 'Invalid';

        console.log(`API - Appointment ${index + 1}:`, {
          appointment_id: apt.appointment_id,
          doctor_id: apt.doctor_id,
          doctor_id_type: typeof apt.doctor_id,
          doctor_id_match: String(apt.doctor_id) === String(doctorId),
          appointment_date: apt.appointment_date,
          appointment_date_iso: aptDateStr,
          appointment_time: apt.appointment_time,
          patient_id: apt.patient_id?._id || apt.patient_id,
          patient_name: apt.patient_id?.name || 'Unknown',
        });
      });
    } else {
      console.log('API - No appointments found for doctor:', doctorId);
      console.log('API - Checking if doctor_id format might be different...');

      // Kiểm tra xem có appointments nào với doctor_id tương tự không
      const similarAppointments = await Appointment.find({}).limit(10);
      console.log(
        'API - All appointments doctor_ids:',
        similarAppointments.map((apt: any) => ({
          appointment_id: apt.appointment_id,
          doctor_id: apt.doctor_id,
          doctor_id_type: typeof apt.doctor_id,
          doctor_id_value: String(apt.doctor_id),
        }))
      );
    }

    return NextResponse.json(appointments, { status: 200 });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
