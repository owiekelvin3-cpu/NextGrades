#!/usr/bin/env node
/**
 * Generate browser + PWA icons from public/brand-icon.png
 * Run: npm run favicons:generate
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const src = path.join(root, "public", "brand-icon.png");

/** NextGrades navy — readable favicon background in light browser chrome */
const BG = { r: 13, g: 27, b: 42, alpha: 1 };

function renderSquare(size, markScale = 0.78) {
  const mark = Math.max(8, Math.round(size * markScale));
  return sharp(src)
    .resize(mark, mark, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()
    .then((markBuf) =>
      sharp({
        create: { width: size, height: size, channels: 4, background: BG },
      }).composite([{ input: markBuf, gravity: "centre" }]).png()
    );
}

const targets = [
  { file: "src/app/icon.png", size: 32, markScale: 0.8 },
  { file: "src/app/apple-icon.png", size: 180, markScale: 0.76 },
  { file: "public/favicon.png", size: 32, markScale: 0.8 },
  { file: "public/apple-touch-icon.png", size: 180, markScale: 0.76 },
  { file: "public/icon-192.png", size: 192, markScale: 0.76 },
  { file: "public/icon-512.png", size: 512, markScale: 0.76 },
];

console.log("Generating favicons from brand-icon.png…\n");

for (const { file, size, markScale } of targets) {
  const out = path.join(root, file);
  await mkdir(path.dirname(out), { recursive: true });
  await (await renderSquare(size, markScale)).toFile(out);
  console.log(`  ✓ ${file} (${size}×${size})`);
}

const icoSizes = [16, 32, 48];
const icoBuffers = await Promise.all(
  icoSizes.map(async (size) => (await renderSquare(size, 0.78)).toBuffer())
);
const ico = await toIco(icoBuffers);
await writeFile(path.join(root, "src/app/favicon.ico"), ico);
console.log(`  ✓ src/app/favicon.ico (${icoSizes.join(", ")}px)`);

console.log("\nDone.");
