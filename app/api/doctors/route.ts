import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";

const USE_MOCK = true; // Sử dụng mock data để test

export async function GET() {
  try {
    await connectMongo();
    if (USE_MOCK) {
      const mockDoctors = [
        { _id: "DOC001", doctor_id: "DOC001", name: "Dr. Nguyen A", specialty: "Nội khoa" },
        { _id: "DOC002", doctor_id: "DOC002", name: "Dr. Tran B", specialty: "Ngoại khoa" },
        { _id: "DOC003", doctor_id: "DOC003", name: "Dr. Le C", specialty: "Nhi khoa" },
      ];
      console.log('Mock doctors:', mockDoctors);
      return NextResponse.json(mockDoctors, { status: 200 });
    }
    const doctors = await Doctor.find().lean();
    console.log('Fetched doctors from DB:', doctors);
    if (!doctors || doctors.length === 0) {
      console.warn('No doctors found in database');
    }
    return NextResponse.json(doctors, { status: 200 });
  } catch (err) {
    console.error('Error fetching doctors:', err);
    return NextResponse.json({ error: 'Đã có lỗi xảy ra' }, { status: 500 });
  }
}