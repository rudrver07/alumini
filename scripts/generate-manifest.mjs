import fs from 'node:fs';
import path from 'node:path';

const FRAMES_DIR = path.join(process.cwd(), 'public', 'animation-frames');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'frames-manifest.json');

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function generateManifest() {
  console.log(`Scanning frames in: ${FRAMES_DIR}`);

  if (!fs.existsSync(FRAMES_DIR)) {
    console.error(`Frames directory does not exist: ${FRAMES_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(FRAMES_DIR);
  const imageFiles = files
    .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
    .sort(naturalSort);

  if (imageFiles.length === 0) {
    console.error('No frame images found in directory!');
    process.exit(1);
  }

  const frames = imageFiles.map((file) => `/animation-frames/${file}`);

  const manifest = {
    totalFrames: frames.length,
    width: 1280,
    height: 720,
    aspectRatio: 1280 / 720,
    format: 'jpg',
    frames,
    generatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`Successfully generated manifest with ${frames.length} frames at: ${OUTPUT_FILE}`);
}

generateManifest();
