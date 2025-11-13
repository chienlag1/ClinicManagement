import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import Bill from '@/models/Bill';

type Ctx = { params: Promise<{ id: string }> };

// GET /api/bills/[id]
export async function GET(_req: NextRequest, context: Ctx) {
  try {
    await connectMongo();
    const { id } = await context.params;

    const bill = await Bill.findById(id)
      .populate('patient', 'patient_id name phone gender birth_date address')
      .populate('prescription', 'prescriptionCode diagnosis')
      .populate(
        'appointment',
        'appointment_id appointment_date appointment_time'
      );

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    return NextResponse.json(bill);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bill' },
      { status: 500 }
    );
  }
}

// PATCH /api/bills/[id]
export async function PATCH(req: NextRequest, context: Ctx) {
  try {
    await connectMongo();
    const { id } = await context.params;
    const data = await req.json();

    // Chỉ cho phép cập nhật một số field nhất định
    const allowedFields = [
      'paymentStatus',
      'paymentDate',
      'paymentOrderCode',
      'notes',
    ];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Convert paymentDate to Date if provided
    if (updateData.paymentDate) {
      updateData.paymentDate = new Date(updateData.paymentDate);
    }

    const bill = await Bill.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    )
      .populate('patient', 'patient_id name phone')
      .populate('prescription', 'prescriptionCode')
      .populate('appointment', 'appointment_id');

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    return NextResponse.json({
      bill,
      message: 'Bill updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating bill:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update bill' },
      { status: 500 }
    );
  }
}
