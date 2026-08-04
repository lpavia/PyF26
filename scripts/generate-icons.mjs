/**
 * Generates the PWA PNG icons from the same "F + dot" brand mark used by
 * public/favicon.svg. Run with `npm run icons` after changing the design.
 *
 * Pure Node (zlib only) — no image dependencies. Shapes are rasterised with
 * 4x supersampling and written out as 8-bit RGBA PNGs.
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SS = 4; // supersampling factor

// Brand palette — kept in sync with favicon.svg and the Tailwind classes.
const BG = [0x31, 0x2e, 0x81]; // indigo-900  — card background
const FAMA = [0xd9, 0x46, 0xef]; // fuchsia-500 — "Fama" chips
const PUNTO = [0xfb, 0xbf, 0x24]; // amber-400   — "Punto" chips

// Mark geometry in normalised [0,1] canvas units. The bounding box of the
// whole mark is centred, so scaling about the centre keeps it balanced.
const STEM = { x0: 0.2175, y0: 0.23, x1: 0.3375, y1: 0.77 };
const ARM_TOP = { x0: 0.2175, y0: 0.23, x1: 0.6625, y1: 0.35 };
const ARM_MID = { x0: 0.2175, y0: 0.455, x1: 0.5775, y1: 0.565 };
const DOT = { cx: 0.6775, cy: 0.665, r: 0.105 };

/* ---------------------------------------------------------------- PNG ---- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(size, rgba) {
  const stride = size * 4;
  const raw = Buffer.alloc(size * (stride + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter type: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ------------------------------------------------------------ drawing ---- */

/** True when (x, y) lies inside a rounded rectangle spanning the whole canvas. */
function insideRoundedSquare(x, y, size, radius) {
  if (radius <= 0) return true;
  const cx = Math.min(Math.max(x, radius), size - radius);
  const cy = Math.min(Math.max(y, radius), size - radius);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= radius * radius;
}

/**
 * Renders one icon.
 *
 * @param {number} size    output edge length in px
 * @param {number} radius  corner radius as a fraction of size (0 = square)
 * @param {number} scale   size of the mark relative to the canvas
 */
function renderIcon(size, radius, scale) {
  const big = size * SS;
  const hi = Buffer.alloc(big * big * 4); // supersampled canvas, RGBA

  // Transform a normalised coordinate into supersampled pixel space.
  const tx = (v) => (0.5 + (v - 0.5) * scale) * big;

  const rects = [STEM, ARM_TOP, ARM_MID].map((r) => ({
    x0: tx(r.x0),
    y0: tx(r.y0),
    x1: tx(r.x1),
    y1: tx(r.y1),
  }));
  const dot = { cx: tx(DOT.cx), cy: tx(DOT.cy), r: DOT.r * scale * big };
  const cornerRadius = radius * big;

  for (let y = 0; y < big; y++) {
    for (let x = 0; x < big; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      if (!insideRoundedSquare(px, py, big, cornerRadius)) continue;

      let colour = BG;
      const dx = px - dot.cx;
      const dy = py - dot.cy;
      if (dx * dx + dy * dy <= dot.r * dot.r) {
        colour = PUNTO;
      } else if (rects.some((r) => px >= r.x0 && px < r.x1 && py >= r.y0 && py < r.y1)) {
        colour = FAMA;
      }

      const i = (y * big + x) * 4;
      hi[i] = colour[0];
      hi[i + 1] = colour[1];
      hi[i + 2] = colour[2];
      hi[i + 3] = 255;
    }
  }

  // Box-downsample. Averaging is done on premultiplied values so that the
  // transparent corners blend correctly instead of picking up black fringes.
  const out = Buffer.alloc(size * size * 4);
  const samples = SS * SS;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const i = ((y * SS + sy) * big + (x * SS + sx)) * 4;
          const alpha = hi[i + 3] / 255;
          r += hi[i] * alpha;
          g += hi[i + 1] * alpha;
          b += hi[i + 2] * alpha;
          a += alpha;
        }
      }
      const i = (y * size + x) * 4;
      if (a === 0) continue;
      out[i] = Math.round(r / a);
      out[i + 1] = Math.round(g / a);
      out[i + 2] = Math.round(b / a);
      out[i + 3] = Math.round((a / samples) * 255);
    }
  }

  return encodePng(size, out);
}

/* --------------------------------------------------------------- main ---- */

const TARGETS = [
  // Standard "any" icons — rounded so they look right where the platform
  // draws them unmasked (Windows taskbar, Chrome menus, Linux launchers).
  { file: 'public/icons/icon-192.png', size: 192, radius: 0.22, scale: 1 },
  { file: 'public/icons/icon-512.png', size: 512, radius: 0.22, scale: 1 },
  // Maskable — full bleed, mark shrunk inside Android's safe zone.
  { file: 'public/icons/icon-maskable-512.png', size: 512, radius: 0, scale: 0.85 },
  // iOS / macOS Safari applies its own squircle mask, so ship it square.
  { file: 'public/apple-touch-icon.png', size: 180, radius: 0, scale: 1 },
];

for (const { file, size, radius, scale } of TARGETS) {
  const path = resolve(ROOT, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, renderIcon(size, radius, scale));
  console.log(`wrote ${file} (${size}x${size})`);
}
