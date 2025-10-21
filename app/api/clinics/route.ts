import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import Clinic from "@/models/Clinic";

const USE_MOCK = true; // Sử dụng mock data để test

export async function GET() {
  try {
    await connectMongo();
    if (USE_MOCK) {
      const mockClinics = [
        { _id: "CL001", clinic_id: "CL001", name: "Phòng khám A", address: "123 Đường Láng, Hà Nội" },
        { _id: "CL002", clinic_id: "CL002", name: "Phòng khám B", address: "456 Nguyễn Trãi, TP.HCM" },
        { _id: "CL003", clinic_id: "CL003", name: "Phòng khám C", address: "789 Đường Cầu Giấy, Hà Nội" },
      ];
      console.log('Mock clinics:', mockClinics);
      return NextResponse.json(mockClinics, { status: 200 });
    }
    const clinics = await Clinic.find().lean();
    console.log('Fetched clinics from DB:', clinics);
    return NextResponse.json(clinics, { status: 200 });
  } catch (error) {
    console.error('Error fetching clinics:', error);
    return NextResponse.json({ error: "Failed to fetch clinics" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectMongo();
    const body = await req.json();
    if (!body.clinic_id || !body.clinic_code || !body.status) {
      return NextResponse.json({ error: "Thiếu clinic_id, clinic_code hoặc status" }, { status: 400 });
    }
    const newClinic = await Clinic.create(body);
    return NextResponse.json(newClinic, { status: 201 });
  } catch (error) {
    console.error('Error creating clinic:', error);
    return NextResponse.json({ error: "Failed to create clinic" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Clinic ID is required" }, { status: 400 });
    }

    const deleted = await Clinic.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Clinic deleted successfully" });
  } catch (error) {
    console.error('Error deleting clinic:', error);
    return NextResponse.json({ error: "Failed to delete clinic" }, { status: 500 });
  }
}