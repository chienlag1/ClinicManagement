import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

import { connectMongo } from '@/lib/mongodb';
import Patient from '@/models/Patient';
import { User } from '@/models/User';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Ctx) {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();
    const { id } = await context.params;

    // Get user role to determine access level
    const user = await User.findOne({ clerkUserId: auth.userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const doc = await Patient.findById(id);
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Check access permissions
    const hasAccess =
      user.role === 'staff' ||
      user.role === 'admin' ||
      user.role === 'doctor' ||
      doc.userId === auth.userId;

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: Ctx) {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();
    const { id } = await context.params;
    const body = await req.json();

    // Get user role to determine access level
    const user = await User.findOne({ clerkUserId: auth.userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.gender !== undefined) data.gender = body.gender;
    if (body.birth_date !== undefined)
      data.birth_date = new Date(body.birth_date);
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.address !== undefined) data.address = body.address;
    if (body.id_card !== undefined) data.id_card = body.id_card;

    // Find the patient first to check access
    const patient = await Patient.findById(id);
    if (!patient) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Check access permissions
    const hasAccess =
      user.role === 'staff' ||
      user.role === 'admin' ||
      user.role === 'doctor' ||
      patient.userId === auth.userId;

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updated = await Patient.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: Ctx) {
  try {
    const auth = getAuth(req);
    if (!auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();
    const { id } = await context.params;

    // Get user role to determine access level
    const user = await User.findOne({ clerkUserId: auth.userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the patient first to check access
    const patient = await Patient.findById(id);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Check access permissions
    const hasAccess =
      user.role === 'staff' ||
      user.role === 'admin' ||
      user.role === 'doctor' ||
      patient.userId === auth.userId;

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const deleted = await Patient.findByIdAndDelete(id);
    return NextResponse.json(
      { message: 'Patient deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    );
  }
}
