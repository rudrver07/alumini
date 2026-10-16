import { NextResponse } from 'next/server';
import { clearAdminSessionCookie, getAdminSession } from '@/lib/auth';
import { recordAuditLog } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getAdminSession();
    if (session) {
      await recordAuditLog({
        admin_id: session.id,
        admin_email: session.email,
        action: 'ADMIN_LOGOUT',
        target: 'AUTH',
      });
    }

    await clearAdminSessionCookie();
    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error: unknown) {
    console.error('[Admin Logout Error]:', error);
    return NextResponse.json({ success: false, error: 'Failed to logout' }, { status: 500 });
  }
}
