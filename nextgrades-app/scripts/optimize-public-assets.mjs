#!/usr/bin/env node
/**
 * Losslessly re-encode PNGs in /public to smaller files (same paths, same visuals).
 * Icons are resized to their display dimensions; logos and marketing images are compressed.
 */
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

/** Exact output sizes for PWA / favicon assets */
const ICON_TARGETS = {
  "favicon.png": 32,
  "apple-touch-icon.png": 180,
  "icon-192.png": 192,
  "icon-512.png": 512,
  "brand-icon.png": 256,
};

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (/\.(png|jpe?g)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

async function optimizeFile(filePath) {
  const rel = path.relative(publicDir, filePath).replace(/\\/g, "/");
  const before = (await stat(filePath)).size;
  const name = path.basename(filePath);

  let pipeline = sharp(filePath, { failOn: "none" }).rotate();

  if (ICON_TARGETS[name]) {
    const size = ICON_TARGETS[name];
    pipeline = pipeline.resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } });
  } else if (/^logo/i.test(name) || name === "logo.png") {
    pipeline = pipeline.resize({ width: 1200, withoutEnlargement: true });
  } else if (/^img-\d+\.png$/i.test(name)) {
    pipeline = pipeline.resize({ width: 1600, withoutEnlargement: true });
  }

  const ext = path.extname(filePath).toLowerCase();
  const isLargeMarketing = /^img-\d+\.png$/i.test(name) && before > 400_000;
  if (ext === ".png") {
    pipeline = pipeline.png(
      isLargeMarketing
        ? { compressionLevel: 9, palette: true, quality: 78, effort: 10 }
        : { compressionLevel: 9, palette: false, effort: 10 }
    );
  } else {
    pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
  }

  const buffer = await pipeline.toBuffer();
  if (buffer.length >= before) {
    return { rel, before, after: before, skipped: true };
  }

  const { writeFile } = await import("node:fs/promises");
  await writeFile(filePath, buffer);
  return { rel, before, after: buffer.length, skipped: false };
}

const files = await walk(publicDir);
let saved = 0;

console.log(`Optimizing ${files.length} images in public/…\n`);

for (const file of files) {
  try {
    const result = await optimizeFile(file);
    const beforeKb = (result.before / 1024).toFixed(1);
    const afterKb = (result.after / 1024).toFixed(1);
    if (result.skipped) {
      console.log(`  skip  ${result.rel} (${beforeKb} KB, no gain)`);
    } else {
      saved += result.before - result.after;
      console.log(`  ok    ${result.rel} ${beforeKb} → ${afterKb} KB`);
    }
  } catch (err) {
    console.warn(`  fail  ${path.relative(publicDir, file)}: ${err.message}`);
  }
}

console.log(`\nTotal saved: ${(saved / 1024 / 1024).toFixed(2)} MB`);
