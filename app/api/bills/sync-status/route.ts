import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import Bill from '@/models/Bill';
import Prescription from '@/models/Prescription';

export async function POST() {
  try {
    await connectMongo();

    // Lấy tất cả bills có prescription
    const bills = await Bill.find({
      prescription: { $exists: true, $ne: null },
    }).populate('prescription');

    let updatedCount = 0;
    let skippedCount = 0;

    for (const bill of bills) {
      const prescription = bill.prescription as any;

      if (!prescription) {
        skippedCount++;
        continue;
      }

      // Kiểm tra nếu prescription có paymentStatus và status
      let shouldUpdate = false;
      const updates: any = {};

      // Đồng bộ paymentStatus từ prescription
      if (
        prescription.paymentStatus &&
        prescription.paymentStatus !== bill.paymentStatus
      ) {
        updates.paymentStatus = prescription.paymentStatus;
        shouldUpdate = true;

        // Nếu paymentStatus là paid, set paymentDate nếu chưa có
        if (prescription.paymentStatus === 'paid' && !bill.paymentDate) {
          updates.paymentDate = new Date();
        }
      }

      // Đồng bộ paymentOrderCode nếu có
      if (prescription.paymentOrderCode && !bill.paymentOrderCode) {
        updates.paymentOrderCode = prescription.paymentOrderCode;
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        await Bill.findByIdAndUpdate(bill._id, updates);
        updatedCount++;
        console.log(
          `Updated bill ${bill.billCode} from prescription ${prescription.prescriptionCode}`
        );
      } else {
        skippedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đồng bộ thành công`,
      updated: updatedCount,
      skipped: skippedCount,
      total: bills.length,
    });
  } catch (error: any) {
    console.error('Sync Error:', error);
    return NextResponse.json(
      { error: error.message || 'Có lỗi xảy ra khi đồng bộ' },
      { status: 500 }
    );
  }
}
