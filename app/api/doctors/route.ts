import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';

// Mock data cho doctors - trong thực tế sẽ lấy từ database
const mockDoctors = [
  {
    _id: '1',
    doctor_id: 'DOC001',
    name: 'Bác sĩ Nguyễn Văn A',
    specialty: 'Tim mạch'
  },
  {
    _id: '2', 
    doctor_id: 'DOC002',
    name: 'Bác sĩ Trần Thị B',
    specialty: 'Nội khoa'
  },
  {
    _id: '3',
    doctor_id: 'DOC003', 
    name: 'Bác sĩ Lê Văn C',
    specialty: 'Ngoại khoa'
  },
  {
    _id: '4',
    doctor_id: 'DOC004',
    name: 'Bác sĩ Phạm Thị D', 
    specialty: 'Nhi khoa'
  },
  {
    _id: '5',
    doctor_id: 'DOC005',
    name: 'Bác sĩ Hoàng Văn E',
    specialty: 'Sản phụ khoa'
  }
];

export async function GET() {
  try {
    // Trả về mock data
    return NextResponse.json(mockDoctors, { status: 200 });
  } catch (err) {
    console.error('Error fetching doctors:', err);
    return NextResponse.json({ error: 'Đã có lỗi xảy ra khi lấy danh sách bác sĩ' }, { status: 500 });
  }
}