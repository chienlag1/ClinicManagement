import Prescription from '@/models/Prescription';
import { connectMongo } from './mongodb';

/**
 * Tạo mã đơn thuốc tự động - số thứ tự tăng dần
 * Format: Số nguyên tăng dần 1, 2, 3, 4, ...
 */
export async function generatePrescriptionCode(): Promise<string> {
  await connectMongo();

  // Tìm đơn thuốc có mã lớn nhất
  const lastPrescription = await Prescription.findOne()
    .sort({ prescriptionCode: -1 })
    .limit(1);

  let nextNumber = 1;

  if (lastPrescription && lastPrescription.prescriptionCode) {
    // Lấy số hiện tại và tăng lên 1
    const currentNumber = parseInt(lastPrescription.prescriptionCode);
    if (!isNaN(currentNumber)) {
      nextNumber = currentNumber + 1;
    }
  }

  return String(nextNumber);
}
