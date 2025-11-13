import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import { connectMongo } from '@/lib/mongodb';
import Prescription from '@/models/Prescription';
import { User } from '@/models/User';
import Medicine from '@/models/Medicine';
import { generatePrescriptionCode } from '@/lib/generatePrescriptionCode';

export async function POST(request: NextRequest) {
  try {
    const auth = getAuth(request);

    if (!auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();
    const data = await request.json();

    // Find User by Clerk ID
    const user = await User.findOne({ clerkUserId: auth.userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Tạo mã đơn thuốc tự động
    const prescriptionCode = await generatePrescriptionCode();

    // Replace doctor field with User ObjectId
    const prescriptionData = {
      ...data,
      prescriptionCode,
      doctor: user._id,
    };

    const prescription = await Prescription.create(prescriptionData);
    await prescription.populate(['patient', 'doctor', 'medicines.medicine']);

    return NextResponse.json({ prescription }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating prescription:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId'); // This is Clerk user ID
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');

    const query: any = {};

    // If doctorId is provided (Clerk user ID), find User and use their ObjectId
    if (doctorId) {
      const user = await User.findOne({ clerkUserId: doctorId });
      if (user) {
        query.doctor = user._id;
      } else {
        // If user not found, return empty array
        return NextResponse.json({ prescriptions: [] });
      }
    }

    if (patientId) query.patient = patientId;
    if (status) query.status = status;

    // Import Medicine model to ensure it's registered before populate
    // This ensures the model is available for population
    const MedicineModel = mongoose.models.Medicine || Medicine;

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name phone')
      .populate('doctor', 'firstName lastName email')
      .populate({
        path: 'medicines.medicine',
        select: 'name',
        model: MedicineModel,
        strictPopulate: false, // Allow populate even if some medicines don't exist
      })
      .sort({ prescriptionDate: -1 })
      .lean();

    return NextResponse.json({ prescriptions });
  } catch (error: any) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch prescriptions' },
      { status: 500 }
    );
  }
}
