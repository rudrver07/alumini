import { describe, it, expect } from 'vitest';
import { EVENT_CONFIG } from '@/config/event.config';
import fs from 'fs';
import path from 'path';

describe('Event Configuration & Audio Asset Integrity', () => {
  it('has participation fee configured as 699 with correct label', () => {
    expect(EVENT_CONFIG.participationFee).toBe(699);
    expect(EVENT_CONFIG.currencySymbol).toBe('₹');
    expect(EVENT_CONFIG.feeLabel).toBe('Participation Fee per Student');
    expect(EVENT_CONFIG.brochureOriginalFee).toBe(799);
    expect(EVENT_CONFIG.feeStatusNote).toContain('pending organizer confirmation');
    expect(EVENT_CONFIG.registrationSuccessAudioPath).toMatch(/\/(audio\/)?registration(-success)?\.wav/);
  });

  it('verifies registration-success audio asset exists in public/audio directory', () => {
    const successAudioPath = path.join(process.cwd(), 'public', 'audio', 'registration-success.wav');
    expect(fs.existsSync(successAudioPath)).toBe(true);
    
    const stats = fs.statSync(successAudioPath);
    expect(stats.size).toBe(178604); // Exact original WAV file size
  });
});
