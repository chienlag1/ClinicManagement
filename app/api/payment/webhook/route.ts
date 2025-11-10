import { NextRequest, NextResponse } from 'next/server';
import { PayOS } from '@payos/node';
import { connectMongo } from '@/lib/mongodb';
import Prescription from '@/models/Prescription';

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
      const prescriptionId = description.match(/([a-f0-9]{24})/)?.[0];

      if (prescriptionId) {
        // Cập nhật trạng thái đơn thuốc
        await connectMongo();
        await Prescription.findByIdAndUpdate(prescriptionId, {
          status: 'completed',
          paymentStatus: 'paid',
          paymentOrderCode: orderCode,
          updatedAt: new Date(),
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
