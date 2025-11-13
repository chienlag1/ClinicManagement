import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import Prescription from '@/models/Prescription';
import Bill from '@/models/Bill';

// POST /api/bills/sync - Tạo bills cho các prescriptions hiện có chưa có bills
export async function POST(req: NextRequest) {
  try {
    await connectMongo();

    // Lấy tất cả prescriptions có medicines nhưng chưa có bills
    const prescriptions = await Prescription.find({
      medicines: { $exists: true, $ne: [] },
    })
      .populate('patient')
      .populate('medicines.medicine');

    let createdCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    for (const prescription of prescriptions) {
      try {
        // Tính tổng tiền từ medicines
        const totalAmount = (prescription.medicines || []).reduce(
          (sum: number, item: any) => {
            const medicine = item.medicine;
            if (medicine && typeof medicine.price === 'number') {
              return sum + medicine.price;
            }
            return sum;
          },
          0
        );

        if (totalAmount <= 0 || !prescription.patient) {
          continue;
        }

        // Kiểm tra xem đã có bill chưa
        const existingBill = await Bill.findOne({
          prescription: prescription._id,
        });

        if (existingBill) {
          // Cập nhật totalAmount nếu đã có bill
          if (existingBill.totalAmount !== totalAmount) {
            existingBill.totalAmount = totalAmount;
            await existingBill.save();
            updatedCount++;
          }
        } else {
          // Tạo bill mới
          await Bill.create({
            patient: prescription.patient._id || prescription.patient,
            prescription: prescription._id,
            description: `Thanh toán đơn thuốc ${prescription.prescriptionCode || ''}`,
            totalAmount: totalAmount,
            paymentStatus: prescription.paymentStatus || 'pending',
            paymentDate:
              prescription.paymentStatus === 'paid' ? new Date() : undefined,
            paymentOrderCode: prescription.paymentOrderCode,
            notes: 'Bill được tạo tự động từ prescription hiện có',
          });
          createdCount++;
        }
      } catch (error: any) {
        errors.push(
          `Error processing prescription ${prescription.prescriptionCode}: ${error.message}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sync completed: ${createdCount} bills created, ${updatedCount} bills updated`,
      created: createdCount,
      updated: updatedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error syncing bills:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync bills' },
      { status: 500 }
    );
  }
}
