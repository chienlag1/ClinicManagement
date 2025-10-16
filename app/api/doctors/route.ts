import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import Doctor from '@/models/Doctor';

export async function GET() {
  try {
    await connectMongo();
    const doctors = await Doctor.find().lean();
    console.log('Fetched doctors:', doctors);
    if (!doctors || doctors.length === 0) {
      console.warn('No doctors found in database');
    }
    return NextResponse.json(doctors, { status: 200 });
  } catch (err) {
    console.error('Error fetching doctors:', err);
    return NextResponse.json({ error: 'Đã có lỗi xảy ra' }, { status: 500 });
  }
}