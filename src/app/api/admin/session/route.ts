import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, session: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      session,
    });
  } catch (error: unknown) {
    console.error('[Session Check Error]:', error);
    return NextResponse.json({ authenticated: false, session: null }, { status: 500 });
  }
}
