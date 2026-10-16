import { google } from 'googleapis';
import { Registration } from '@/types';
import { getAllRegistrationsForExport, markRegistrationsAsSynced } from './db';

const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY || '';
const spreadsheetId = process.env.GOOGLE_SHEET_ID || '';

// Clean private key formatting (replaces literal \n with newlines)
const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

export function isGoogleSheetsConfigured(): boolean {
  return Boolean(clientEmail && rawPrivateKey && spreadsheetId);
}

function getGoogleAuthClient() {
  if (!isGoogleSheetsConfigured()) {
    return null;
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export function formatRegistrationRow(reg: Registration): (string | number)[] {
  return [
    reg.registration_id,
    reg.full_name,
    reg.email,
    reg.phone,
    reg.aktu_roll_no || reg.college || '',
    reg.department,
    reg.year_of_study,
    reg.city,
    reg.state,
    reg.status,
    reg.payment_status,
    reg.referral_code || 'N/A',
    reg.expectations || '',
    new Date(reg.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  ];
}

export async function syncRegistrationToSheets(reg: Registration): Promise<{
  synced: boolean;
  error?: string;
}> {
  if (!isGoogleSheetsConfigured()) {
    console.info(`[Google Sheets] Credentials not configured. Skipped live append for ${reg.registration_id}.`);
    return { synced: false, error: 'Google Sheets credentials not configured' };
  }

  try {
    const auth = getGoogleAuthClient();
    if (!auth) throw new Error('Could not initialize Google Auth client');

    const sheets = google.sheets({ version: 'v4', auth });
    const row = formatRegistrationRow(reg);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Registrations!A:N',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    });

    await markRegistrationsAsSynced([reg.id]);
    return { synced: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Google Sheets] Live sync error for ${reg.registration_id}:`, message);
    return { synced: false, error: message };
  }
}

export async function syncAllPendingToSheets(): Promise<{
  syncedCount: number;
  totalPending: number;
  error?: string;
}> {
  if (!isGoogleSheetsConfigured()) {
    return {
      syncedCount: 0,
      totalPending: 0,
      error: 'Google Sheets credentials not configured in environment variables (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID).',
    };
  }

  try {
    const auth = getGoogleAuthClient();
    if (!auth) throw new Error('Could not initialize Google Auth client');

    const allRegistrations = await getAllRegistrationsForExport();
    const pending = allRegistrations.filter((r) => !r.synced_to_sheets);

    if (pending.length === 0) {
      return { syncedCount: 0, totalPending: 0 };
    }

    const sheets = google.sheets({ version: 'v4', auth });
    const rows = pending.map(formatRegistrationRow);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Registrations!A:N',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: rows,
      },
    });

    await markRegistrationsAsSynced(pending.map((p) => p.id));
    return { syncedCount: pending.length, totalPending: pending.length };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Google Sheets] Bulk sync error:', message);
    return { syncedCount: 0, totalPending: 0, error: message };
  }
}
