import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import mongoose from 'mongoose';
import Appointment from '@/models/Appointment';
import Patient from '@/models/Patient';

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
    const appointments = await Appointment.find({ doctor_id: doctorId })
      .populate({
        path: 'patient_id',
        select: 'patient_id name phone',
        model: PatientModel, // Use the verified registered model
      })
      .sort({ appointment_date: 1, appointment_time: 1 });

    console.log(
      `Found ${appointments.length} appointments for doctor ${doctorId}`
    );

    return NextResponse.json(appointments, { status: 200 });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
