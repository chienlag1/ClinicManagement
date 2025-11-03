import { NextResponse } from 'next/server';

import { connectMongo } from '@/lib/mongodb';
import Medicine from '@/models/Medicine';

export async function GET(req: Request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    const filter: any = {};
    if (type && type.trim() !== '') {
      filter.type = type.trim();
    }

    const medicines = await Medicine.find(filter).sort({ createdAt: -1 });

    // If requesting types only
    if (searchParams.get('getTypes') === 'true') {
      const types = await Medicine.distinct('type');
      return NextResponse.json(types.sort(), { status: 200 });
    }

    return NextResponse.json(medicines, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching medicines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medicines', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectMongo();
    const body = await req.json();

    // Validate required fields
    if (
      !body.medicine_code ||
      !body.medicine_name ||
      !body.type ||
      !body.price ||
      !body.unit
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: medicine_code, medicine_name, type, price, unit',
        },
        { status: 400 }
      );
    }

    // Validate string fields are not empty
    if (
      typeof body.medicine_code !== 'string' ||
      body.medicine_code.trim() === ''
    ) {
      return NextResponse.json(
        { error: 'Medicine code must be a non-empty string' },
        { status: 400 }
      );
    }

    if (
      typeof body.medicine_name !== 'string' ||
      body.medicine_name.trim() === ''
    ) {
      return NextResponse.json(
        { error: 'Medicine name must be a non-empty string' },
        { status: 400 }
      );
    }

    if (typeof body.type !== 'string' || body.type.trim() === '') {
      return NextResponse.json(
        { error: 'Type must be a non-empty string' },
        { status: 400 }
      );
    }

    if (typeof body.unit !== 'string' || body.unit.trim() === '') {
      return NextResponse.json(
        { error: 'Unit must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate price is a number
    const price = Number(body.price);
    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    const newMed = await Medicine.create({
      medicine_code: body.medicine_code.trim(),
      medicine_name: body.medicine_name.trim(),
      type: body.type.trim(),
      price: price,
      unit: body.unit.trim(),
    });

    return NextResponse.json(newMed, { status: 201 });
  } catch (error: any) {
    console.error('Error creating medicine:', error);

    // Handle duplicate key error
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create medicine', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Medicine ID is required' },
        { status: 400 }
      );
    }

    const deleted = await Medicine.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Medicine not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Medicine deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting medicine:', error);
    return NextResponse.json(
      { error: 'Failed to delete medicine', details: error.message },
      { status: 500 }
    );
  }
}
