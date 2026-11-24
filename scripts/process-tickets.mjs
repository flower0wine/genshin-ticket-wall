// Process generated whole-ticket images: resize to web width, flood-fill the
// outer white background to transparent, then encode as alpha WebP (small).
// The source PNG is removed after conversion.
// Usage: node scripts/process-tickets.mjs [slug...]   (no args = all)
import sharp from "sharp";
import { readdirSync } from "node:fs";
import { writeFile, unlink } from "node:fs/promises";
import path from "node:path";

const DIR = path.resolve("public/tickets");
const TARGET_W = 1000;
const THRESH = 244;

const wanted = process.argv.slice(2);
const files = readdirSync(DIR).filter((f) => f.endsWith(".png"))
  .filter((f) => !wanted.length || wanted.includes(f.replace(/\.png$/, "")));

for (const f of files) {
  const file = path.join(DIR, f);
  const meta = await sharp(file).metadata();
  let pipeline = sharp(file);
  if ((meta.width ?? 0) > TARGET_W) pipeline = pipeline.resize(TARGET_W, null, { fit: "inside" });
  const { data, info } = await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const isWhite = (i) => data[i] >= THRESH && data[i + 1] >= THRESH && data[i + 2] >= THRESH;
  const visited = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const p = stack.pop();
    if (visited[p]) continue;
    visited[p] = 1;
    const i = p * 4;
    if (!isWhite(i)) continue;
    data[i + 3] = 0;
    const x = p % w, y = (p / w) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }
  const buf = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .webp({ quality: 84, alphaQuality: 90 }).toBuffer();
  const out = file.replace(/\.png$/, ".webp");
  await writeFile(out, buf);
  await unlink(file);
  console.log(`ok ${f}: ${meta.width}x${meta.height} -> ${w}x${h} webp (${(buf.length / 1024).toFixed(0)}KB)`);
}