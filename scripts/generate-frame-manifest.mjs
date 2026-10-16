import fs from 'node:fs';
import path from 'node:path';

const FRAMES_DIR = path.join(process.cwd(), 'public', 'animation', 'frames');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'animation', 'manifest.json');
const LEGACY_OUTPUT = path.join(process.cwd(), 'public', 'frames-manifest.json');

const SUPPORTED_EXTENSIONS = /\.(jpe?g|png|webp|avif)$/i;

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function parseJpegDimensions(buffer) {
  let i = 0;
  const len = buffer.length;
  while (i < len) {
    if (buffer[i] === 0xff) {
      const marker = buffer[i + 1];
      if (
        marker === 0xc0 ||
        marker === 0xc1 ||
        marker === 0xc2 ||
        marker === 0xc3 ||
        marker === 0xc5 ||
        marker === 0xc6 ||
        marker === 0xc7 ||
        marker === 0xc9 ||
        marker === 0xca ||
        marker === 0xcb ||
        marker === 0xcd ||
        marker === 0xce ||
        marker === 0xcf
      ) {
        const h = buffer.readUInt16BE(i + 5);
        const w = buffer.readUInt16BE(i + 7);
        return { width: w, height: h };
      } else if (marker === 0xd8 || marker === 0xd9) {
        i += 2;
      } else if (marker === 0xda) {
        break;
      } else {
        const segLen = buffer.readUInt16BE(i + 2);
        i += 2 + segLen;
      }
    } else {
      i++;
    }
  }
  return { width: 1280, height: 720 };
}

function parsePngDimensions(buffer) {
  if (buffer.length > 24 && buffer.toString('ascii', 1, 4) === 'PNG') {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }
  return { width: 1280, height: 720 };
}

function detectDimensions(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    if (filePath.toLowerCase().endsWith('.png')) {
      return parsePngDimensions(buffer);
    }
    return parseJpegDimensions(buffer);
  } catch {
    return { width: 1280, height: 720 };
  }
}

function generateManifest() {
  console.log(`[Manifest Generator] Scanning frames directory: ${FRAMES_DIR}`);

  if (!fs.existsSync(FRAMES_DIR)) {
    console.error(`[Error] Frames directory does not exist: ${FRAMES_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(FRAMES_DIR);
  const frameFiles = files
    .filter((f) => SUPPORTED_EXTENSIONS.test(f))
    .sort(naturalSort);

  if (frameFiles.length === 0) {
    console.error(`[Error] No supported image frames found in ${FRAMES_DIR}`);
    process.exit(1);
  }

  const samplePath = path.join(FRAMES_DIR, frameFiles[0]);
  const { width, height } = detectDimensions(samplePath);
  const ext = path.extname(frameFiles[0]).replace('.', '').toLowerCase();

  const frames = frameFiles.map((f) => `/animation/frames/${f}`);

  const manifest = {
    totalFrames: frames.length,
    width,
    height,
    aspectRatio: width / height,
    format: ext,
    frames,
    generatedAt: new Date().toISOString(),
  };

  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`[Success] Generated manifest with ${frames.length} frames at: ${OUTPUT_FILE}`);

  // Write legacy location too for backwards compatibility
  fs.writeFileSync(LEGACY_OUTPUT, JSON.stringify(manifest, null, 2), 'utf-8');
}

generateManifest();
