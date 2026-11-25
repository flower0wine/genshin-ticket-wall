// Find original generated ticket PNGs in the codex cache by matching dimensions/aspect.
// The originals are ~1880-1905 x 825-840 (aspect ~2.28). Map them to tickets by
// re-deriving which slug each exec produced is not stored, so instead we just list
// candidate originals and let a regen-free reprocess use them via a manifest we build
// by perceptual hash against current webp. Simpler: report count + sizes.
import { readdirSync, existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
const CACHE = "C:/Users/flowerwine/.codex/generated_images";
const dirs = readdirSync(CACHE);
const candidates = [];
for (const d of dirs) {
  const sub = path.join(CACHE, d);
  let files;
  try { files = readdirSync(sub).filter((f) => f.endsWith(".png")); } catch { continue; }
  for (const f of files) {
    const fp = path.join(sub, f);
    try {
      const m = await sharp(fp).metadata();
      if (m.width >= 1500 && m.height >= 600 && m.width / m.height > 2 && m.width / m.height < 2.6) {
        candidates.push({ path: fp, w: m.width, h: m.height });
      }
    } catch {}
  }
}
console.log("ticket-shaped originals in cache:", candidates.length);
import { writeFileSync } from "node:fs";
writeFileSync("gen/cache-originals.json", JSON.stringify(candidates, null, 2));
console.log("written gen/cache-originals.json");