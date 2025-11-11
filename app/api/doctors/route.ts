import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import { User, UserDoc } from '@/models/User';

export async function GET() {
  try {
    await connectMongo();

    // Lấy danh sách users có role = 'doctor'
    const users = await User.find({ role: 'doctor' })
      .select('_id clerkUserId email firstName lastName')
      .sort({ firstName: 1, lastName: 1 })
      .lean();

    // Format lại để match với format mà AppointmentForm expect
    const doctors = users.map((user: any) => ({
      _id: user._id?.toString() || '',
      doctor_id: user.clerkUserId || '', // Sử dụng clerkUserId làm doctor_id
      name:
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        user.email ||
        'Unknown',
      specialty: 'General', // Mặc định, có thể thêm field specialty vào User model sau
    }));

    console.log('Fetched doctors from Users (role=doctor):', doctors.length);

    return NextResponse.json(doctors, { status: 200 });
  } catch (err) {
    console.error('Error fetching doctors:', err);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi lấy danh sách bác sĩ' },
      { status: 500 }
    );
  }
}
