import Prescription from '@/models/Prescription';
import { connectMongo } from './mongodb';

/**
 * Tạo mã đơn thuốc tự động - số thứ tự tăng dần
 * Format: Số nguyên tăng dần 1, 2, 3, 4, ...
 */
export async function generatePrescriptionCode(): Promise<string> {
  await connectMongo();

  // Đếm tổng số prescription và cộng thêm 1
  const count = await Prescription.countDocuments();
  let nextNumber = count + 1;

  // Kiểm tra xem mã đã tồn tại chưa (để tránh trường hợp đã xóa prescription)
  let prescriptionCode = String(nextNumber);
  let exists = await Prescription.findOne({ prescriptionCode });

  // Nếu mã đã tồn tại, tìm mã tiếp theo chưa được sử dụng
  while (exists) {
    nextNumber++;
    prescriptionCode = String(nextNumber);
    exists = await Prescription.findOne({ prescriptionCode });
  }

  return prescriptionCode;
}
