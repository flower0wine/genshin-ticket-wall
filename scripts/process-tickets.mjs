// Robust background removal: flood-fill from borders with a HIGH threshold so it
// only removes the pure-white outer background and cannot leak through anti-aliased
// outline pixels into off-white ticket content. Then feather the cut edge slightly.
// Usage: node scripts/process-tickets.mjs [slug...]   (no args = all PNGs in public/tickets)
import sharp from "sharp";
import { readdirSync } from "node:fs";
import { writeFile, unlink } from "node:fs/promises";
import path from "node:path";

const DIR = path.resolve("public/tickets");
const TARGET_W = 1000;
const THRESH = 250; // near-pure-white only; off-white content (<=249) is preserved

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
  const isBg = (i) => data[i] >= THRESH && data[i + 1] >= THRESH && data[i + 2] >= THRESH;
  const removed = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const p = stack.pop();
    if (removed[p]) continue;
    const i = p * 4;
    if (!isBg(i)) continue;
    removed[p] = 1;
    data[i + 3] = 0;
    const x = p % w, y = (p / w) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }
  // feather: opaque pixels adjacent to removed bg get partial alpha for a clean edge
  for (let p = 0; p < w * h; p++) {
    if (removed[p]) continue;
    const x = p % w, y = (p / w) | 0;
    let nearBg = false;
    if (x > 0 && removed[p - 1]) nearBg = true;
    else if (x < w - 1 && removed[p + 1]) nearBg = true;
    else if (y > 0 && removed[p - w]) nearBg = true;
    else if (y < h - 1 && removed[p + w]) nearBg = true;
    if (nearBg) data[p * 4 + 3] = Math.min(data[p * 4 + 3], 235);
  }
  const buf = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .webp({ quality: 86, alphaQuality: 95 }).toBuffer();
  const out = file.replace(/\.png$/, ".webp");
  await writeFile(out, buf);
  await unlink(file);
  console.log(`ok ${f}: ${meta.width}x${meta.height} -> ${w}x${h} webp (${(buf.length / 1024).toFixed(0)}KB)`);
}