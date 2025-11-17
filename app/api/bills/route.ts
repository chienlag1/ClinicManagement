import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import Bill from '@/models/Bill';

// GET /api/bills?patientId=xxx&status=paid&from=2024-01-01&to=2024-12-31&page=1&limit=10
export async function GET(req: NextRequest) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get('limit') || 10))
    );

    const filter: any = {};

    if (patientId) {
      filter.patient = patientId;
    }

    if (status && ['pending', 'paid', 'cancelled'].includes(status)) {
      filter.paymentStatus = status;
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) {
        filter.createdAt.$gte = new Date(from);
      }
      if (to) {
        // Add 23:59:59 to include the whole day
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    const skip = (page - 1) * limit;

    // Debug: Log filter và count
    console.log('API Bills - Filter:', JSON.stringify(filter, null, 2));
    const totalCount = await Bill.countDocuments(filter);
    console.log('API Bills - Total count:', totalCount);

    const [items, total] = await Promise.all([
      Bill.find(filter)
        .populate('patient', 'patient_id name phone')
        .populate('prescription', 'prescriptionCode')
        .populate('appointment', 'appointment_id')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Bill.countDocuments(filter),
    ]);

    console.log('API Bills - Found items:', items.length, 'out of', total);
    if (items.length > 0) {
      console.log('API Bills - Sample item:', {
        _id: items[0]._id,
        billCode: items[0].billCode,
        patient: items[0].patient,
        prescription: items[0].prescription,
        totalAmount: items[0].totalAmount,
        paymentStatus: items[0].paymentStatus,
      });
    }

    return NextResponse.json(
      { items, total, page, limit, pages: Math.ceil(total / limit) },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}

// POST /api/bills
export async function POST(req: NextRequest) {
  try {
    await connectMongo();
    const body = await req.json();

    // Validate required fields
    if (!body.patient || !body.totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: patient, totalAmount' },
        { status: 400 }
      );
    }

    const bill = await Bill.create({
      patient: body.patient,
      prescription: body.prescription,
      appointment: body.appointment,
      description: body.description || 'Thanh toán đơn thuốc',
      totalAmount: body.totalAmount,
      paymentStatus: body.paymentStatus || 'pending',
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : undefined,
      paymentOrderCode: body.paymentOrderCode,
      notes: body.notes,
    });

    const populatedBill = await Bill.findById(bill._id)
      .populate('patient', 'patient_id name phone')
      .populate('prescription', 'prescriptionCode')
      .populate('appointment', 'appointment_id');

    return NextResponse.json(populatedBill, { status: 201 });
  } catch (error: any) {
    console.error('Error creating bill:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create bill' },
      { status: 500 }
    );
  }
}
