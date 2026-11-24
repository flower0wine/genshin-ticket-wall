// Optimize generated art: trim white margin, resize to 900px, save web-friendly PNG.
// Usage: node scripts/optimize-art.mjs
import sharp from "sharp";
import { readdirSync } from "node:fs";
import path from "node:path";

const ART = path.resolve("public/art");
for (const f of readdirSync(ART).filter((x) => x.endsWith("-stage.png"))) {
  const file = path.join(ART, f);
  const img = sharp(file);
  const meta = await img.metadata();
  if ((meta.width ?? 0) <= 900) { console.log(`skip ${f} (${meta.width}px)`); continue; }
  const buf = await sharp(file)
    .trim({ background: "#ffffff", threshold: 12 })
    .resize(900, 900, { fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toBuffer();
  const { writeFile } = await import("node:fs/promises");
  await writeFile(file, buf);
  console.log(`ok ${f}: ${(meta.size / 1024).toFixed(0)}KB -> ${(buf.length / 1024).toFixed(0)}KB`);
}