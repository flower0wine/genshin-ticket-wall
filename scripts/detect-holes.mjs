// Detect interior transparency holes caused by flood-fill leaking through the
// ticket outline into white content areas. Reports hole pixel count per ticket.
import sharp from "sharp";
import { readdirSync } from "node:fs";
import path from "node:path";

const DIR = path.resolve("public/tickets");
const files = readdirSync(DIR).filter((f) => f.endsWith(".webp"));
const results = [];
for (const f of files) {
  const { data, info } = await sharp(path.join(DIR, f)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  // BFS from border over transparent pixels = exterior; remaining transparent = interior holes
  const exterior = new Uint8Array(w * h);
  const stack = [];
  const isT = (p) => data[p * 4 + 3] < 128;
  for (let x = 0; x < w; x++) { stack.push(x, (h - 1) * w + x); }
  for (let y = 0; y < h; y++) { stack.push(y * w, y * w + w - 1); }
  while (stack.length) {
    const p = stack.pop();
    if (exterior[p] || !isT(p)) continue;
    exterior[p] = 1;
    const x = p % w, y = (p / w) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }
  let holes = 0;
  for (let p = 0; p < w * h; p++) if (isT(p) && !exterior[p]) holes++;
  results.push({ slug: f.replace(/\.webp$/, ""), holes, pct: (holes / (w * h) * 100).toFixed(2) });
}
results.sort((a, b) => b.holes - a.holes);
for (const r of results) if (r.holes > 500) console.log(`${r.slug}: ${r.holes}px (${r.pct}%)`);
console.log(`--- ${results.filter((r) => r.holes > 500).length} tickets with interior holes > 500px ---`);