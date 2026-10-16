import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Animation Manifest & Asset Integrity', () => {
  const animationManifestPath = path.join(process.cwd(), 'public', 'animation', 'manifest.json');
  const legacyManifestPath = path.join(process.cwd(), 'public', 'frames-manifest.json');

  it('contains a valid frames manifest at public/animation/manifest.json', () => {
    expect(fs.existsSync(animationManifestPath)).toBe(true);

    const content = JSON.parse(fs.readFileSync(animationManifestPath, 'utf-8'));
    expect(content.totalFrames).toBe(300);
    expect(content.width).toBe(1280);
    expect(content.height).toBe(720);
    expect(content.frames).toHaveLength(300);
    expect(content.frames[0]).toMatch(/\/animation\/frames\/ezgif-frame-001\.jpg/);
    expect(content.frames[299]).toMatch(/\/animation\/frames\/ezgif-frame-300\.jpg/);
  });

  it('maintains backwards-compatible manifest at public/frames-manifest.json', () => {
    expect(fs.existsSync(legacyManifestPath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(legacyManifestPath, 'utf-8'));
    expect(content.totalFrames).toBe(300);
  });

  it('verifies that actual frame files exist on disk in public/animation/frames', () => {
    const frame1 = path.join(process.cwd(), 'public', 'animation', 'frames', 'ezgif-frame-001.jpg');
    const frame300 = path.join(process.cwd(), 'public', 'animation', 'frames', 'ezgif-frame-300.jpg');

    expect(fs.existsSync(frame1)).toBe(true);
    expect(fs.existsSync(frame300)).toBe(true);

    const stats1 = fs.statSync(frame1);
    expect(stats1.size).toBeGreaterThan(10000);
  });
});
