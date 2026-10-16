import ExcelJS from 'exceljs';
import { Registration } from '@/types';
import { EVENT_CONFIG } from '@/config/event.config';

// Formula Injection Protection (CWE-1236)
export function sanitizeFormula(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

export async function generateRegistrationsExcelBuffer(registrations: Registration[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ILLUMINATE Platform - E-Cell IIT Bombay';
  workbook.lastModifiedBy = 'Admin Export Engine';
  workbook.created = new Date();
  workbook.modified = new Date();

  // 1. MAIN REGISTRATIONS SHEET
  const worksheet = workbook.addWorksheet('Participants', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 4, topLeftCell: 'A5' }],
  });

  // Title block
  worksheet.mergeCells('A1:M1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'ILLUMINATE WORKSHOP 2026 — OFFICIAL REGISTRATION ROSTER';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF991B1B' }, // Deep Crimson Red
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 36;

  // Subtitle / metadata row
  worksheet.mergeCells('A2:M2');
  const subCell = worksheet.getCell('A2');
  subCell.value = `Organized by Entrepreneurship Cell, IIT Bombay | Exported on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} | Total Records: ${registrations.length}`;
  subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FFD1D5DB' } };
  subCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF18181B' }, // Dark Zinc
  };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(2).height = 20;

  worksheet.getRow(3).height = 10; // spacer

  // Table Columns
  worksheet.columns = [
    { key: 'reg_id', width: 18 },
    { key: 'name', width: 24 },
    { key: 'email', width: 28 },
    { key: 'phone', width: 16 },
    { key: 'aktu_roll_no', width: 22 },
    { key: 'dept', width: 22 },
    { key: 'year', width: 14 },
    { key: 'city', width: 16 },
    { key: 'state', width: 18 },
    { key: 'status', width: 14 },
    { key: 'payment', width: 14 },
    { key: 'referral', width: 16 },
    { key: 'created_at', width: 22 },
  ];

  // Table Headers (Row 4)
  const headers = [
    'Registration ID',
    'Full Name',
    'Email Address',
    'Phone Number',
    'AKTU Roll No.',
    'Department',
    'Year',
    'City',
    'State',
    'Status',
    'Payment',
    'Referral Code',
    'Registered At',
  ];

  const headerRow = worksheet.getRow(4);
  headerRow.height = 26;

  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF7F1D1D' }, // Rich Red Header
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF450A0A' } },
      bottom: { style: 'medium', color: { argb: 'FFDC2626' } },
      left: { style: 'thin', color: { argb: 'FF450A0A' } },
      right: { style: 'thin', color: { argb: 'FF450A0A' } },
    };
  });

  // Populate data
  registrations.forEach((reg, idx) => {
    const rowNum = idx + 5;
    const row = worksheet.getRow(rowNum);
    row.height = 20;

    const rowValues = [
      sanitizeFormula(reg.registration_id),
      sanitizeFormula(reg.full_name),
      sanitizeFormula(reg.email),
      sanitizeFormula(reg.phone),
      sanitizeFormula(reg.aktu_roll_no || reg.college || '—'),
      sanitizeFormula(reg.department),
      sanitizeFormula(reg.year_of_study),
      sanitizeFormula(reg.city),
      sanitizeFormula(reg.state),
      sanitizeFormula(reg.status.toUpperCase()),
      sanitizeFormula(reg.payment_status.toUpperCase()),
      sanitizeFormula(reg.referral_code || '—'),
      new Date(reg.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    ];

    rowValues.forEach((val, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.value = val;
      cell.font = { name: 'Calibri', size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: colIdx === 0 || colIdx >= 9 ? 'center' : 'left' };

      // Zebra striping
      const isEven = idx % 2 === 0;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF9FAFB' },
      };

      // Status pill coloring
      if (colIdx === 9) {
        if (reg.status === 'confirmed') {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF166534' } };
        } else if (reg.status === 'pending_payment') {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF854D0E' } };
        } else {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF991B1B' } };
        }
      }

      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      };
    });
  });

  if (registrations.length === 0) {
    const emptyRow = worksheet.getRow(5);
    emptyRow.height = 24;
    worksheet.mergeCells('A5:M5');
    const emptyCell = emptyRow.getCell(1);
    emptyCell.value = 'No registered participants yet.';
    emptyCell.font = { name: 'Calibri', size: 11, italic: true, color: { argb: 'FF6B7280' } };
    emptyCell.alignment = { vertical: 'middle', horizontal: 'center' };
  }

  // 2. SUMMARY KPI SHEET
  const summarySheet = workbook.addWorksheet('Summary KPIs');
  summarySheet.columns = [{ width: 28 }, { width: 20 }];

  summarySheet.mergeCells('A1:B1');
  const sumTitle = summarySheet.getCell('A1');
  sumTitle.value = 'WORKSHOP REGISTRATION METRICS';
  sumTitle.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  sumTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF991B1B' } };
  sumTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  summarySheet.getRow(1).height = 30;

  const total = registrations.length;
  const confirmed = registrations.filter((r) => r.status === 'confirmed').length;
  const pending = registrations.filter((r) => r.status === 'pending_payment').length;
  const cancelled = registrations.filter((r) => r.status === 'cancelled').length;
  const uniqueRollNos = new Set(registrations.map((r) => (r.aktu_roll_no || r.college || '').toLowerCase().trim()).filter(Boolean)).size;
  const uniqueStates = new Set(registrations.map((r) => r.state.toLowerCase().trim())).size;

  const stats = [
    ['Total Registered Participants', total],
    ['Confirmed Registrations', confirmed],
    ['Pending Payment', pending],
    ['Cancelled', cancelled],
    ['AKTU Students Registered', uniqueRollNos],
    ['Geographic States Covered', uniqueStates],
    ['Estimated Registration Value (INR)', total * EVENT_CONFIG.participationFee],
  ];

  stats.forEach(([label, value], i) => {
    const row = summarySheet.getRow(i + 3);
    row.getCell(1).value = label;
    row.getCell(1).font = { name: 'Calibri', size: 11, bold: true };
    row.getCell(2).value = value;
    row.getCell(2).font = { name: 'Calibri', size: 11 };
    row.getCell(2).alignment = { horizontal: 'right' };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
