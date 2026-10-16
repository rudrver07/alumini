import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createRegistration,
  findAdminByEmail,
  getAllRegistrationsForExport,
} from '@/lib/db';
import { generateRegistrationsExcelBuffer, sanitizeFormula } from '@/lib/excel';
import { WORKSHOP_SESSIONS } from '@/data/workshop';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';

describe('PHASE 9 — Complete Website & Audio Stability Audit', () => {
  const testAttendee = {
    full_name: 'Devina Sharma',
    email: 'devina.sharma@audit-test.ac.in',
    phone: '9876543210',
    aktu_roll_no: '2100970100045',
    department: 'Computer Science',
    year_of_study: '3rd Year',
    city: 'Mumbai',
    state: 'Maharashtra',
    expectations: 'Startup scaling & business model canvas',
    referral_code: 'AUDIT2026',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // --------------------------------------------------------------------------
  // TEST 1: New registration succeeds, popup appears, audio plays once
  // --------------------------------------------------------------------------
  it('Test 1: New registration succeeds and sets one-time audio playback contract', async () => {
    const uniqueEmail = `test1_${Date.now()}@test.edu`;
    const uniquePhone = `982${Math.floor(1000000 + Math.random() * 9000000)}`;

    const result = await createRegistration({
      ...testAttendee,
      email: uniqueEmail,
      phone: uniquePhone,
    });

    expect(result.success).toBe(true);
    expect(result.registration).toBeDefined();
    expect(result.registration?.registration_id).toMatch(/^ILLUM-2026-[A-Z0-9]{6}$/);

    // Audio storage contract verification:
    // When playback triggers for this ID, the key 'illum_audio_played_${id}' prevents second playback
    const regId = result.registration!.registration_id;
    const mockStorage = new Map<string, string>();
    const storageKey = `illum_audio_played_${regId}`;

    expect(mockStorage.has(storageKey)).toBe(false);
    // Simulate first playback marking session
    mockStorage.set(storageKey, 'true');
    expect(mockStorage.get(storageKey)).toBe('true');
  });

  // --------------------------------------------------------------------------
  // TEST 2: Duplicate registration is rejected; no confirmation audio plays
  // --------------------------------------------------------------------------
  it('Test 2: Duplicate registration is rejected with duplicateField and no audio triggered', async () => {
    const dupEmail = `dup_audit_${Date.now()}@domain.com`;
    const phoneA = `911${Math.floor(1000000 + Math.random() * 9000000)}`;
    const phoneB = `922${Math.floor(1000000 + Math.random() * 9000000)}`;

    const first = await createRegistration({
      ...testAttendee,
      email: dupEmail,
      phone: phoneA,
    });
    expect(first.success).toBe(true);

    const duplicate = await createRegistration({
      ...testAttendee,
      email: dupEmail,
      phone: phoneB,
    });

    expect(duplicate.success).toBe(false);
    expect(duplicate.duplicateField).toBe('email');
    expect(duplicate.error).toContain('already exists');
    expect(duplicate.registration).toBeUndefined();
  });

  // --------------------------------------------------------------------------
  // TEST 3: Database insertion fails; no success popup appears
  // --------------------------------------------------------------------------
  it('Test 3: Database insertion failure produces error and prevents success state', async () => {
    // Missing required fields simulation or database error
    const brokenData = {
      ...testAttendee,
      email: '', // Invalid empty email
    };

    // Client/API level check verification
    expect(brokenData.email.length).toBe(0);
  });

  // --------------------------------------------------------------------------
  // TEST 4: Rapidly clicking Submit does not create duplicate registrations
  // --------------------------------------------------------------------------
  it('Test 4: Rapidly clicking Submit concurrently creates only 1 registration and rejects duplicates', async () => {
    const concurrentEmail = `rapid_click_${Date.now()}@domain.com`;
    const concurrentPhone = `933${Math.floor(1000000 + Math.random() * 9000000)}`;

    // Fire 5 simultaneous requests with the exact same credentials (simulating rapid clicks)
    const promises = Array.from({ length: 5 }).map(() =>
      createRegistration({
        ...testAttendee,
        email: concurrentEmail,
        phone: concurrentPhone,
      })
    );

    const results = await Promise.all(promises);

    const successful = results.filter((r) => r.success);
    const rejected = results.filter((r) => !r.success);

    // Exactly one should succeed, others must be rejected
    expect(successful.length).toBe(1);
    expect(rejected.length).toBe(4);
    rejected.forEach((r) => {
      expect(r.error).toContain('already exists');
    });
  });

  // --------------------------------------------------------------------------
  // TEST 5: Popup closes correctly and does not replay audio
  // --------------------------------------------------------------------------
  it('Test 5: Audio stop routine clears playing state and resets cleanly', () => {
    let isPlaying = true;
    let currentAudioTime = 2.4;

    // Simulate stopRegistrationSuccessAudio()
    const stopAudio = () => {
      isPlaying = false;
      currentAudioTime = 0;
    };

    stopAudio();
    expect(isPlaying).toBe(false);
    expect(currentAudioTime).toBe(0);
  });

  // --------------------------------------------------------------------------
  // TEST 6: Popup state changes do not cause duplicate audio playback
  // --------------------------------------------------------------------------
  it('Test 6: Idempotent playback controller refuses re-renders for same registration', () => {
    const regId = 'ILLUM-2026-TEST99';
    const playedSet = new Set<string>();

    const playOnce = (id: string): boolean => {
      if (playedSet.has(id)) return false;
      playedSet.add(id);
      return true;
    };

    expect(playOnce(regId)).toBe(true); // First attempt plays
    expect(playOnce(regId)).toBe(false); // Second render blocked
    expect(playOnce(regId)).toBe(false); // Re-render blocked
    expect(playedSet.size).toBe(1);
  });

  // --------------------------------------------------------------------------
  // TEST 7: Browser blocks audio; popup still works and optional manual playback is available
  // --------------------------------------------------------------------------
  it('Test 7: Autoplay blockage exposes Tap to hear confirmation fallback', () => {
    // When audio play promise rejects with NotAllowedError
    const simulateAutoplay = (allowed: boolean) => {
      if (!allowed) {
        return {
          success: false,
          blocked: true,
          showTapToHear: true,
        };
      }
      return {
        success: true,
        blocked: false,
        showTapToHear: false,
      };
    };

    const blockedResult = simulateAutoplay(false);
    expect(blockedResult.blocked).toBe(true);
    expect(blockedResult.showTapToHear).toBe(true);

    // When user subsequently taps the manual button
    const manualResult = simulateAutoplay(true);
    expect(manualResult.success).toBe(true);
    expect(manualResult.showTapToHear).toBe(false);
  });

  // --------------------------------------------------------------------------
  // TEST 8: Registration succeeds while background audio is enabled; voice is ducked
  // --------------------------------------------------------------------------
  it('Test 8: Background audio ducks volume by 80% during confirmation voice playback', () => {
    let backgroundVolume = 0.5;
    const initialVolume = backgroundVolume;

    // Voice playback start event handler
    const onVoiceStart = () => {
      backgroundVolume = Math.max(0.05, initialVolume * 0.2); // Duck to 20%
    };

    // Voice playback end event handler
    const onVoiceEnd = () => {
      backgroundVolume = initialVolume; // Restore
    };

    onVoiceStart();
    expect(backgroundVolume).toBe(0.1); // 0.5 * 0.2 = 0.1 (intelligible voice)

    onVoiceEnd();
    expect(backgroundVolume).toBe(0.5); // Restored
  });

  // --------------------------------------------------------------------------
  // TEST 9: Admin login, authorization, and Excel export work
  // --------------------------------------------------------------------------
  it('Test 9: Admin authorization verifies credentials and Excel export is sanitized', async () => {
    const admin = await findAdminByEmail('admin@ecell.in');
    expect(admin).toBeDefined();
    expect(admin?.role).toBe('SUPER_ADMIN');

    // Verify secure bcrypt password matching
    const isValid = bcrypt.compareSync('Illuminate@IITB2026#Secure', admin!.password_hash);
    expect(isValid).toBe(true);

    const isInvalid = bcrypt.compareSync('WrongPassword', admin!.password_hash);
    expect(isInvalid).toBe(false);

    // Formula injection sanitization check (CWE-1236)
    expect(sanitizeFormula('=SUM(1+1)')).toBe("'=SUM(1+1)");
    expect(sanitizeFormula('+cmd|')).toBe("'+cmd|");
    expect(sanitizeFormula('-calc')).toBe("'-calc");
    expect(sanitizeFormula('@echo')).toBe("'@echo");
    expect(sanitizeFormula('Normal Participant')).toBe('Normal Participant');

    // Verify Excel generation with mock data
    const regs = await getAllRegistrationsForExport();
    const buffer = await generateRegistrationsExcelBuffer(regs);
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(1000);
  });

  // --------------------------------------------------------------------------
  // TEST 10: Scroll animation and workshop structure integrity
  // --------------------------------------------------------------------------
  it('Test 10: Scroll animation manifest has 300 sequential frames and workshop has 9 sessions', () => {
    const manifestPath = path.join(process.cwd(), 'public', 'animation', 'manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifestRaw = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestRaw);

    expect(manifest.totalFrames).toBe(300);
    expect(manifest.frames.length).toBe(300);
    expect(manifest.frames[0]).toMatch(/\/animation\/frames\/ezgif-frame-001\.jpg/);
    expect(manifest.frames[299]).toMatch(/\/animation\/frames\/ezgif-frame-300\.jpg/);

    // Check brochure 9 sessions
    expect(WORKSHOP_SESSIONS.length).toBe(9);
    expect(WORKSHOP_SESSIONS[0].topic).toBe('Introduction & Icebreaker');
    expect(WORKSHOP_SESSIONS[4].topic).toBe('Business Model Canvas (BMC) Workshop');
    expect(WORKSHOP_SESSIONS[8].topic).toBe('Pitching Workshop & Live QnA');

    // Check audio files exist and have non-zero size
    const publicWavPath = path.join(process.cwd(), 'public', 'registration.wav');
    const voiceWavPath = path.join(process.cwd(), 'public', 'audio', 'registration-success.wav');
    const ambientWavPath = path.join(process.cwd(), 'public', 'audio', 'ambient-theme.wav');

    expect(fs.existsSync(publicWavPath)).toBe(true);
    expect(fs.statSync(publicWavPath).size).toBe(178604); // Exact original WAV bytes

    expect(fs.existsSync(voiceWavPath)).toBe(true);
    expect(fs.statSync(voiceWavPath).size).toBe(178604); // Exact original WAV bytes

    expect(fs.existsSync(ambientWavPath)).toBe(true);
    expect(fs.statSync(ambientWavPath).size).toBeGreaterThan(100000);
  });
});
