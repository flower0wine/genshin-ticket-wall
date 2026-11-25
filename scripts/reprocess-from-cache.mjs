// Match each ticket webp to its original cached PNG by perceptual similarity,
// then reprocess the ORIGINAL with the fixed high-threshold flood-fill.
// This recovers content the old low-threshold pass wrongly removed.
import sharp from "sharp";
import { readFileSync, readdirSync } from "node:fs";
import { writeFile, unlink } from "node:fs/promises";
import path from "node:path";

const DIR = path.resolve("public/tickets");
const TARGET_W = 1000;
const THRESH = 250;
const candidates = JSON.parse(readFileSync("gen/cache-originals.json", "utf8"));

// tiny grayscale signature (16x8) for fast matching
async function sig(buf) {
  const { data } = await sharp(buf).greyscale().resize(16, 8, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  return data;
}
function dist(a, b) { let s = 0; for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]); return s / a.length; }

// precompute candidate signatures (resize original to 16x8)
const candSigs = [];
for (const c of candidates) {
  try { candSigs.push({ ...c, sig: await sig(c.path) }); } catch {}
}

const slugs = process.argv.slice(2);
const tickets = readdirSync(DIR).filter((f) => f.endsWith(".webp"))
  .map((f) => f.replace(/\.webp$/, "")).filter((s) => !slugs.length || slugs.includes(s));

let fixed = 0, unmatched = 0;
for (const slug of tickets) {
  try {
  const webp = path.join(DIR, `${slug}.webp`);
  // copy target to gen/ before sharp reads it — sharp holds a Windows lock on the
  // source path that would block replacing the target afterwards.
  const fsSync0 = await import("node:fs");
  const readCopy = path.resolve("gen", `read-${slug}.webp`);
  fsSync0.copyFileSync(webp, readCopy);
  const ts = await sig(readCopy);
  try { fsSync0.unlinkSync(readCopy); } catch {}
  let best = null, bestD = Infinity;
  for (const c of candSigs) { const d = dist(ts, c.sig); if (d < bestD) { bestD = d; best = c; } }
  if (!best || bestD > 28) { console.log(`UNMATCHED ${slug} (d=${bestD?.toFixed(1)})`); unmatched++; continue; }
  // reprocess original
  const meta = await sharp(best.path).metadata();
  let pipeline = sharp(best.path);
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
    removed[p] = 1; data[i + 3] = 0;
    const x = p % w, y = (p / w) | 0;
    if (x > 0) stack.push(p - 1); if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w); if (y < h - 1) stack.push(p + w);
  }
  for (let p = 0; p < w * h; p++) {
    if (removed[p]) continue;
    const x = p % w, y = (p / w) | 0;
    const nearBg = (x > 0 && removed[p-1]) || (x < w-1 && removed[p+1]) || (y > 0 && removed[p-w]) || (y < h-1 && removed[p+w]);
    if (nearBg) data[p*4+3] = Math.min(data[p*4+3], 235);
  }
  const buf = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).webp({ quality: 86, alphaQuality: 95 }).toBuffer();
  // Write to gen/ first (sharp may hold a transient lock on the source path),
  // then copy into public/tickets via sync fs.
  const fsSync = await import("node:fs");
  const staging = path.resolve("gen", `fixed-${slug}.webp`);
  fsSync.writeFileSync(staging, buf);
  const old = webp + ".old";
  let written = false;
  for (let attempt = 0; attempt < 5 && !written; attempt++) {
    try {
      try { fsSync.unlinkSync(old); } catch {}
      try { fsSync.renameSync(webp, old); } catch {}
      fsSync.copyFileSync(staging, webp);
      written = true;
      try { fsSync.unlinkSync(old); } catch {}
    } catch (e) {
      console.log(`  attempt ${attempt}: ${e.code} ${String(e.message).slice(0,70)}`);
      try { fsSync.renameSync(old, webp); } catch {}
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  try { fsSync.unlinkSync(staging); } catch {}
  if (!written) { console.log(`WRITE-FAIL ${slug}`); unmatched++; continue; }
  console.log(`fixed ${slug} (d=${bestD.toFixed(1)}, ${(buf.length/1024).toFixed(0)}KB)`);
  fixed++;
  } catch (e) { console.log(`ERROR ${slug}: ${String(e).slice(0, 80)}`); unmatched++; }
}
console.log(`done: ${fixed} fixed, ${unmatched} unmatched`);