import { describe, it, expect } from 'vitest';
import {
  createRegistration,
  generateRegistrationId,
} from '@/lib/db';
import { RegistrationInput } from '@/types';

describe('Registration System & Duplicate Checks', () => {
  const sampleInput: RegistrationInput = {
    full_name: 'Aditya Kashyap',
    email: 'aditya.k@test-college.edu',
    phone: '+91 99887 76655',
    aktu_roll_no: '2100970100045',
    department: 'Computer Engineering',
    year_of_study: '3rd Year',
    city: 'Mumbai',
    state: 'Maharashtra',
    expectations: 'Validation of BMC model',
    referral_code: 'TEST2026',
  };

  it('generates a valid registration ID formatted as ILLUM-2026-XXXXXX', () => {
    const regId = generateRegistrationId();
    expect(regId).toMatch(/^ILLUM-2026-[A-Z0-9]{6}$/);
  });

  it('successfully creates a new registration', async () => {
    const uniqueEmail = `test_${Date.now()}@example.com`;
    const uniquePhone = `98200${Math.floor(10000 + Math.random() * 90000)}`;

    const res = await createRegistration({
      ...sampleInput,
      email: uniqueEmail,
      phone: uniquePhone,
    });

    expect(res.success).toBe(true);
    expect(res.registration).toBeDefined();
    expect(res.registration?.email).toBe(uniqueEmail.toLowerCase());
    expect(res.registration?.registration_id).toMatch(/^ILLUM-2026-/);
    expect(res.registration?.status).toBe('confirmed');
  });

  it('rejects duplicate email registrations', async () => {
    const dupEmail = `dup_email_${Date.now()}@domain.com`;
    const phone1 = `91111${Math.floor(10000 + Math.random() * 90000)}`;
    const phone2 = `92222${Math.floor(10000 + Math.random() * 90000)}`;

    // First registration
    const res1 = await createRegistration({
      ...sampleInput,
      email: dupEmail,
      phone: phone1,
    });
    expect(res1.success).toBe(true);

    // Second registration with same email
    const res2 = await createRegistration({
      ...sampleInput,
      email: dupEmail,
      phone: phone2,
    });
    expect(res2.success).toBe(false);
    expect(res2.duplicateField).toBe('email');
    expect(res2.error).toContain('email address already exists');
  });

  it('rejects duplicate phone registrations', async () => {
    const dupPhone = `93333${Math.floor(10000 + Math.random() * 90000)}`;
    const email1 = `phone_test_1_${Date.now()}@domain.com`;
    const email2 = `phone_test_2_${Date.now()}@domain.com`;

    // First registration
    const res1 = await createRegistration({
      ...sampleInput,
      email: email1,
      phone: dupPhone,
    });
    expect(res1.success).toBe(true);

    // Second registration with same phone
    const res2 = await createRegistration({
      ...sampleInput,
      email: email2,
      phone: dupPhone,
    });
    expect(res2.success).toBe(false);
    expect(res2.duplicateField).toBe('phone');
    expect(res2.error).toContain('phone number already exists');
  });

  it('accepts non-strict email and phone formatting', async () => {
    const testEmail = `valid.student+tag_${Date.now()}_${Math.random()}@sub.college.ac.in`;
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const testPhone = `+91 (022) 2576-${randSuffix}`; // international format with symbols

    const res = await createRegistration({
      ...sampleInput,
      email: testEmail,
      phone: testPhone,
    });

    expect(res.success).toBe(true);
    expect(res.registration?.phone).toBe(testPhone);
  });
});
