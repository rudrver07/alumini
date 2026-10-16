import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { syncAllPendingToSheets, isGoogleSheetsConfigured } from '@/lib/sheets';
import { recordAuditLog } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized administrative access' }, { status: 401 });
    }

    if (!isGoogleSheetsConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Google Sheets credentials are not configured in environment variables. Add GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEET_ID to enable live synchronization.',
        },
        { status: 400 }
      );
    }

    const result = await syncAllPendingToSheets();

    await recordAuditLog({
      admin_id: session.id,
      admin_email: session.email,
      action: 'SYNC_GOOGLE_SHEETS',
      target: 'SPREADSHEET',
      metadata: { syncedCount: result.syncedCount, pending: result.totalPending },
    });

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      syncedCount: result.syncedCount,
      totalPending: result.totalPending,
      message: `Successfully synchronized ${result.syncedCount} participants to Google Sheets.`,
    });
  } catch (error: unknown) {
    console.error('[Sync Sheets Error]:', error);
    return NextResponse.json({ error: 'Failed to synchronize with Google Sheets' }, { status: 500 });
  }
}
