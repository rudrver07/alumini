import fs from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getAllRegistrationsForExport, recordAuditLog } from '@/lib/db';
import { generateRegistrationsExcelBuffer } from '@/lib/excel';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized administrative access' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'xlsx';

    const registrations = await getAllRegistrationsForExport();

    await recordAuditLog({
      admin_id: session.id,
      admin_email: session.email,
      action: 'EXPORT_REGISTRATIONS',
      target: format.toUpperCase(),
      metadata: { count: registrations.length },
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    if (format === 'csv') {
      const headers = [
        'Registration ID',
        'Full Name',
        'Email',
        'Phone',
        'AKTU Roll No.',
        'Department',
        'Year',
        'City',
        'State',
        'Status',
        'Payment Status',
        'Referral Code',
        'Registered At',
      ];

      const sanitizeCsv = (val: string | undefined | null) => {
        if (!val) return '""';
        let str = String(val);
        // Prefix with single quote if string begins with =, +, -, @, \t, \r to neutralize formula execution
        if (/^[=+\-@\t\r]/.test(str)) {
          str = `'${str}`;
        }
        return `"${str.replace(/"/g, '""')}"`;
      };

      const csvRows = [
        headers.join(','),
        ...registrations.map((r) =>
          [
            sanitizeCsv(r.registration_id),
            sanitizeCsv(r.full_name),
            sanitizeCsv(r.email),
            sanitizeCsv(r.phone),
            sanitizeCsv(r.aktu_roll_no || r.college),
            sanitizeCsv(r.department),
            sanitizeCsv(r.year_of_study),
            sanitizeCsv(r.city),
            sanitizeCsv(r.state),
            sanitizeCsv(r.status),
            sanitizeCsv(r.payment_status),
            sanitizeCsv(r.referral_code),
            sanitizeCsv(r.created_at),
          ].join(',')
        ),
      ];

      const csvContent = csvRows.join('\r\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="illuminate_registrations_${timestamp}.csv"`,
        },
      });
    }

    // Default: Professional XLSX
    const buffer = await generateRegistrationsExcelBuffer(registrations);
    const uint8Array = new Uint8Array(buffer);

    return new Response(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="illuminate_registrations_${timestamp}.xlsx"; filename*=UTF-8''illuminate_registrations_${timestamp}.xlsx`,
        'Content-Length': String(uint8Array.byteLength),
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
      },
    });
  } catch (error: unknown) {
    console.error('[Admin Export Error]:', error);
    return NextResponse.json({ error: 'Failed to generate export file' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized administrative access' }, { status: 401 });
    }

    const registrations = await getAllRegistrationsForExport();
    const buffer = await generateRegistrationsExcelBuffer(registrations);

    const downloadsDir = path.join(
      process.env.USERPROFILE || process.env.HOME || path.join(process.cwd(), '.data'),
      'Downloads'
    );
    const targetDir = fs.existsSync(downloadsDir) ? downloadsDir : path.join(process.cwd(), '.data');
    const targetFile = path.join(targetDir, 'illuminate_registrations_2026.xlsx');

    fs.writeFileSync(targetFile, buffer);

    await recordAuditLog({
      admin_id: session.id,
      admin_email: session.email,
      action: 'EXPORT_REGISTRATIONS_LOCAL',
      target: 'XLSX_DOWNLOADS',
      metadata: { count: registrations.length, path: targetFile },
    });

    return NextResponse.json({
      success: true,
      path: targetFile,
      count: registrations.length,
      message: `File saved successfully to ${targetFile}`,
    });
  } catch (error: unknown) {
    console.error('[Admin Direct Export Error]:', error);
    return NextResponse.json({ error: 'Failed to save local export file' }, { status: 500 });
  }
}

