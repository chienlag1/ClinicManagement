import { NextRequest, NextResponse } from 'next/server';
import { PayOS } from '@payos/node';
import { connectMongo } from '@/lib/mongodb';
import Prescription from '@/models/Prescription';
import Bill from '@/models/Bill';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Khởi tạo PayOS
    const payos = new PayOS({
      clientId: process.env.PAYOS_CLIENT_ID || '',
      apiKey: process.env.PAYOS_API_KEY || '',
      checksumKey: process.env.PAYOS_CHECKSUM_KEY || '',
    });

    // Xác minh webhook từ PayOS
    const webhookData = (await payos.webhooks.verify(body)) as any;

    if (webhookData.code === '00' && webhookData.data) {
      // Thanh toán thành công
      const { orderCode, description } = webhookData.data;

      // Trích xuất prescriptionId từ description
      // PayOS description format: "Don thuoc {orderCode}" - cần lấy từ request body hoặc từ prescription
      await connectMongo();

      // Tìm prescription bằng paymentOrderCode nếu có
      let prescription = null;
      if (orderCode) {
        prescription = await Prescription.findOne({
          paymentOrderCode: orderCode,
        })
          .populate('patient')
          .populate('medicines.medicine');
      }

      // Nếu không tìm thấy bằng orderCode, thử tìm bằng prescriptionId trong description
      if (!prescription) {
        const prescriptionId = description.match(/([a-f0-9]{24})/)?.[0];
        if (prescriptionId) {
          prescription = await Prescription.findById(prescriptionId)
            .populate('patient')
            .populate('medicines.medicine');
        }
      }

      if (prescription) {
        // Cập nhật trạng thái đơn thuốc
        await Prescription.findByIdAndUpdate(prescription._id, {
          status: 'completed',
          paymentStatus: 'paid',
          paymentOrderCode: orderCode,
          updatedAt: new Date(),
        });

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

        // Tìm hoặc tạo Bill
        // Tìm bill hiện có với prescription này
        let existingBill = await Bill.findOne({
          prescription: prescription._id,
        });

        if (existingBill) {
          // Cập nhật bill hiện có khi thanh toán thành công
          existingBill.paymentStatus = 'paid';
          existingBill.paymentDate = new Date();
          existingBill.paymentOrderCode = orderCode;
          existingBill.totalAmount = totalAmount; // Cập nhật lại tổng tiền
          await existingBill.save();
          console.log(
            `Updated bill ${existingBill.billCode} for prescription ${prescription.prescriptionCode}`
          );
        } else if (prescription.patient) {
          // Tạo bill mới nếu chưa có
          await Bill.create({
            patient: prescription.patient._id || prescription.patient,
            prescription: prescription._id,
            description: `Thanh toán đơn thuốc ${prescription.prescriptionCode || ''}`,
            totalAmount: totalAmount,
            paymentStatus: 'paid',
            paymentDate: new Date(),
            paymentOrderCode: orderCode,
          });
          console.log(
            `Created bill for prescription ${prescription.prescriptionCode}`
          );
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
