import { NextRequest, NextResponse } from 'next/server';
import { PayOS } from '@payos/node';
import { getAbsoluteUrl } from '@/lib/getBaseUrl';
import { connectMongo } from '@/lib/mongodb';
import Prescription from '@/models/Prescription';

export async function POST(request: NextRequest) {
  try {
    const { prescriptionId, amount, description } = await request.json();

    console.log('Payment request:', { prescriptionId, amount, description });

    if (!prescriptionId || !amount) {
      return NextResponse.json(
        { error: 'Thiếu thông tin thanh toán' },
        { status: 400 }
      );
    }

    // Kiểm tra PayOS credentials
    if (
      !process.env.PAYOS_CLIENT_ID ||
      !process.env.PAYOS_API_KEY ||
      !process.env.PAYOS_CHECKSUM_KEY
    ) {
      console.error('Missing PayOS credentials');
      return NextResponse.json(
        { error: 'Chưa cấu hình PayOS credentials' },
        { status: 500 }
      );
    }

    await connectMongo();

    // Tạo mã đơn hàng duy nhất
    const orderCode = Number(String(Date.now()).slice(-6));

    // Lưu paymentOrderCode vào prescription trước khi tạo payment link
    await Prescription.findByIdAndUpdate(prescriptionId, {
      paymentOrderCode: orderCode,
      updatedAt: new Date(),
    });

    // Khởi tạo PayOS
    const payos = new PayOS({
      clientId: process.env.PAYOS_CLIENT_ID,
      apiKey: process.env.PAYOS_API_KEY,
      checksumKey: process.env.PAYOS_CHECKSUM_KEY,
    });

    // Tạo thanh toán với PayOS
    const paymentData = {
      orderCode: orderCode,
      amount: amount,
      description: `Don thuoc ${orderCode}`, // Max 25 ký tự
      returnUrl: getAbsoluteUrl(
        `/staff/prescriptions/${prescriptionId}?payment=success`
      ),
      cancelUrl: getAbsoluteUrl(
        `/staff/prescriptions/${prescriptionId}?payment=cancel`
      ),
    };

    console.log('Creating payment with data:', paymentData);

    const paymentLinkResponse = await payos.paymentRequests.create(paymentData);

    console.log('Payment link created:', paymentLinkResponse);

    return NextResponse.json({
      success: true,
      checkoutUrl: paymentLinkResponse.checkoutUrl,
      orderCode: orderCode,
    });
  } catch (error: any) {
    console.error('PayOS Error Details:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
    });
    return NextResponse.json(
      {
        error: error.message || 'Không thể tạo thanh toán',
        details: error.response?.data || error.toString(),
      },
      { status: 500 }
    );
  }
}
