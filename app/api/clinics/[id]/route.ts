import { NextResponse } from 'next/server';

import Clinic from '@/models/Clinic';
import { connectMongo } from '@/lib/mongodb';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongo();
    const { id } = await context.params;

    const clinic = await Clinic.findById(id);

    if (!clinic) {
      return NextResponse.json(
        {
          error: 'Không tìm thấy phòng khám',
        },
        { status: 404 }
      );
    }

    console.log('Fetched clinic:', clinic);
    return NextResponse.json(clinic);
  } catch (error) {
    console.error('Error fetching clinic:', error);
    return NextResponse.json(
      {
        error: 'Không thể lấy thông tin phòng khám. Vui lòng thử lại.',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongo();
    const { id } = await context.params;
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

    // Check if clinic_id or clinic_code already exists (excluding current clinic)
    const existingClinic = await Clinic.findOne({
      _id: { $ne: id },
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

    const updatedClinic = await Clinic.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedClinic) {
      return NextResponse.json(
        {
          error: 'Không tìm thấy phòng khám',
        },
        { status: 404 }
      );
    }

    console.log('Updated clinic:', updatedClinic);
    return NextResponse.json(updatedClinic);
  } catch (error) {
    console.error('Error updating clinic:', error);
    return NextResponse.json(
      {
        error: 'Không thể cập nhật phòng khám. Vui lòng thử lại.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongo();
    const { id } = await context.params;

    const deleted = await Clinic.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        {
          error: 'Không tìm thấy phòng khám',
        },
        { status: 404 }
      );
    }

    console.log('Deleted clinic:', deleted);
    return NextResponse.json({
      message: 'Xóa phòng khám thành công',
    });
  } catch (error) {
    console.error('Error deleting clinic:', error);
    return NextResponse.json(
      {
        error: 'Không thể xóa phòng khám. Vui lòng thử lại.',
      },
      { status: 500 }
    );
  }
}
