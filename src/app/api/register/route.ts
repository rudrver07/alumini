import { NextRequest, NextResponse } from 'next/server';
import { createRegistration } from '@/lib/db';
import { syncRegistrationToSheets } from '@/lib/sheets';
import { RegistrationInput } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      full_name,
      email,
      phone,
      aktu_roll_no,
      college,
      department,
      year_of_study,
      city,
      state,
      expectations,
      referral_code,
    } = body;

    const rollNo = aktu_roll_no || college;

    // Check mandatory fields presence
    if (!full_name || !email || !phone || !rollNo || !department || !year_of_study || !city || !state) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please fill in all required registration fields.',
        },
        { status: 400 }
      );
    }

    // Basic non-strict validation (as per requirements: "do not impose strict email or phone formatting rules")
    if (typeof email !== 'string' || !email.includes('@') || email.trim().length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please enter a valid email address containing @.',
          field: 'email',
        },
        { status: 400 }
      );
    }

    if (typeof phone !== 'string' || phone.trim().length < 5) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please enter a valid contact phone number.',
          field: 'phone',
        },
        { status: 400 }
      );
    }

    const input: RegistrationInput = {
      full_name: String(full_name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      aktu_roll_no: String(rollNo).trim(),
      department: String(department).trim(),
      year_of_study: String(year_of_study).trim(),
      city: String(city).trim(),
      state: String(state).trim(),
      expectations: expectations ? String(expectations).trim() : '',
      referral_code: referral_code ? String(referral_code).trim().toUpperCase() : '',
    };

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const result = await createRegistration(input, { ip, userAgent });

    if (!result.success || !result.registration) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to register',
          duplicateField: result.duplicateField,
        },
        { status: 409 }
      );
    }

    // Trigger background Google Sheets sync if configured (non-blocking)
    syncRegistrationToSheets(result.registration).catch((err) => {
      console.warn('[Sync Registration Error]', err);
    });

    return NextResponse.json(
      {
        success: true,
        registration: result.registration,
        message: 'Registration confirmed successfully!',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('[Registration API Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An internal server error occurred while processing registration. Please try again.',
      },
      { status: 500 }
    );
  }
}
