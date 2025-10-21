import { NextResponse, NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { connectMongo } from '@/lib/mongodb';
import { generatePatientId } from '@/lib/patient-utils';
import Patient from '@/models/Patient';
import { User } from '@/models/User';

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

    const auth = getAuth(req);
    if (!auth.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user role to determine access level
    const user = await User.findOne({ clerkUserId: auth.userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let items = [];
    let total = 0;

    if (user.role === 'staff' || user.role === 'admin' || user.role === 'doctor') {
      // Staff/admin/doctor can see all patients
      const query: any = {};
      
      // Apply search filter
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { id_card: { $regex: search, $options: 'i' } },
          { patient_id: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Apply gender filter
      if (gender) {
        query.gender = gender;
      }

      const skip = (page - 1) * limit;
      items = await Patient.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      
      total = await Patient.countDocuments(query);
    } else {
      // Regular users can only see their own profile
      const patient = await Patient.findOne({ userId: auth.userId });
      items = patient ? [patient] : [];
      total = patient ? 1 : 0;
    }

    return NextResponse.json(
      { items, total, page, limit, pages: Math.ceil(total / limit) },
      { status: 200 }
    );
  } catch (error) {
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectMongo();
    const body = await req.json();

    // Get user role to determine access level
    const user = await User.findOne({ clerkUserId: auth.userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

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

    // Determine target userId
    let targetUserId = auth.userId;
    
    // If staff/admin/doctor, they can create patients for other users
    if ((user.role === 'staff' || user.role === 'admin' || user.role === 'doctor') && body.userId) {
      targetUserId = body.userId;
    }

    // Check if profile already exists for this user
    const existingProfile = await Patient.findOne({ userId: targetUserId });
    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists for this user' },
        { status: 400 }
      );
    }

    // Generate a unique patient ID
    const patient_id = await generatePatientId();

    const created = await Patient.create({
      patient_id,
      id_card: body.id_card,
      name: body.name,
      gender: body.gender,
      birth_date: new Date(body.birth_date),
      phone: body.phone,
      address: body.address,
      userId: targetUserId,
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
