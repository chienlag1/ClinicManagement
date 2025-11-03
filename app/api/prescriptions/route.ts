import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { connectMongo } from '@/lib/mongodb';
import Prescription from '@/models/Prescription';
import { User } from '@/models/User';

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

    // Replace doctor field with User ObjectId
    const prescriptionData = {
      ...data,
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

    const prescriptions = await Prescription.find(query)
      .populate(['patient', 'doctor', 'medicines.medicine'])
      .sort({ prescriptionDate: -1 });

    return NextResponse.json({ prescriptions });
  } catch (error: any) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
