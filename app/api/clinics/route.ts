import { NextResponse } from 'next/server';

import { connectMongo } from '@/lib/mongodb';
import Clinic from '@/models/Clinic';

const USE_MOCK = false; // Sử dụng dữ liệu thật từ database

export async function GET() {
  try {
    await connectMongo();
    if (USE_MOCK) {
      const mockClinics = [
        {
          _id: 'CL001',
          clinic_id: 'CL001',
          name: 'Phòng khám A',
          address: '123 Đường Láng, Hà Nội',
        },
        {
          _id: 'CL002',
          clinic_id: 'CL002',
          name: 'Phòng khám B',
          address: '456 Nguyễn Trãi, TP.HCM',
        },
        {
          _id: 'CL003',
          clinic_id: 'CL003',
          name: 'Phòng khám C',
          address: '789 Đường Cầu Giấy, Hà Nội',
        },
      ];

      return NextResponse.json(mockClinics, { status: 200 });
    }
    const clinics = await Clinic.find().lean();

    return NextResponse.json(clinics, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch clinics' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectMongo();
    const body = await req.json();

    // Validate required fields
    if (!body.clinic_id || !body.clinic_code || !body.status) {
      return NextResponse.json(
        {
          error: 'Thiếu thông tin bắt buộc: clinic_id, clinic_code hoặc status',
        },
        { status: 400 }
      );
    }

    // Check if clinic_id or clinic_code already exists
    const existingClinic = await Clinic.findOne({
      $or: [{ clinic_id: body.clinic_id }, { clinic_code: body.clinic_code }],
    });

    if (existingClinic) {
      return NextResponse.json(
        {
          error: 'Phòng khám với ID hoặc mã này đã tồn tại',
        },
        { status: 409 }
      );
    }

    const newClinic = await Clinic.create(body);

    return NextResponse.json(newClinic, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        error: 'Không thể tạo phòng khám mới. Vui lòng thử lại.',
      },
      { status: 500 }
    );
  }
}
