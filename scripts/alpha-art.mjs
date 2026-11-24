// Remove white background from generated art -> transparent PNG (flood-fill from borders).
// Keeps interior whites (hair, shirt) intact. Usage: node scripts/alpha-art.mjs
import sharp from "sharp";
import { readdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const ART = path.resolve("public/art");
const THRESH = 245; // near-white

for (const f of readdirSync(ART).filter((x) => x.endsWith("-stage.png"))) {
  const file = path.join(ART, f);
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const isWhite = (i) => data[i] >= THRESH && data[i + 1] >= THRESH && data[i + 2] >= THRESH;
  const visited = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) { stack.push(x, (h - 1) * w + x); }
  for (let y = 0; y < h; y++) { stack.push(y * w, y * w + w - 1); }
  while (stack.length) {
    const p = stack.pop();
    if (visited[p]) continue;
    visited[p] = 1;
    const i = p * 4;
    if (!isWhite(i)) continue;
    data[i + 3] = 0; // transparent
    const x = p % w, y = (p / w) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }
  // soften edge: pixels adjacent to removed ones get partial alpha
  const buf = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(file, buf);
  console.log(`alpha ${f} (${(buf.length / 1024).toFixed(0)}KB)`);
}