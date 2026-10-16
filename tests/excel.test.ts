import { describe, it, expect } from 'vitest';
import { generateRegistrationsExcelBuffer } from '@/lib/excel';
import { Registration } from '@/types';

describe('Excel Generation Engine', () => {
  const dummyRegistrations: Registration[] = [
    {
      id: 'reg-1',
      registration_id: 'ILLUM-2026-A1B2C3',
      full_name: 'Test Student',
      email: 'student@iitb.ac.in',
      phone: '+91 98765 43210',
      aktu_roll_no: '2100970100045',
      department: 'Electrical Engineering',
      year_of_study: '4th Year',
      city: 'Mumbai',
      state: 'Maharashtra',
      expectations: 'Startup mentorship',
      referral_code: 'TEST2026',
      status: 'confirmed',
      payment_status: 'paid',
      synced_to_sheets: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  it('generates a valid, non-empty Excel buffer', async () => {
    const buffer = await generateRegistrationsExcelBuffer(dummyRegistrations);
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(1000); // Standard XLSX header is > 1KB

    // Check PK zip signature for XLSX (.docx/.xlsx are zip archives starting with 'PK' 0x50 0x4B)
    expect(buffer[0]).toBe(0x50);
    expect(buffer[1]).toBe(0x4b);
  });
});
