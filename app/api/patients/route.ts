import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { connectMongo } from '@/lib/mongodb';
import Patient from '@/models/Patient';

// GET /api/patients?search=&gender=&page=1&limit=10
export async function GET(req: NextRequest) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const gender = (searchParams.get('gender') || '').trim();
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get('limit') || 10))
    );

    const filter: any = {};

    if (search) {
      const regex = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
      );

      filter.$or = [{ name: regex }, { phone: regex }];
    }
    if (gender === 'male' || gender === 'female') {
      filter.gender = gender;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Patient.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Patient.countDocuments(filter),
    ]);

    return NextResponse.json(
      { items, total, page, limit, pages: Math.ceil(total / limit) },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

// POST /api/patients
export async function POST(req: NextRequest) {
  try {
    const auth = getAuth(req);

    if (!auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();
    const body = await req.json();

    // Validate required fields
    if (
      !body?.name ||
      !body?.gender ||
      !body?.birth_date ||
      !body?.phone ||
      !body?.address ||
      !body?.id_card
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const created = await Patient.create({
      id_card: body.id_card,
      name: body.name,
      gender: body.gender,
      birth_date: new Date(body.birth_date),
      phone: body.phone,
      address: body.address,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];

      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}
