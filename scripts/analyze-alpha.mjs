// Analyze ayaka.webp alpha channel: how many semi-transparent pixels, and where.
import sharp from "sharp";
const { data, info } = await sharp("public/tickets/ayaka.webp").ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
let opaque = 0, semi = 0, trans = 0;
const semiByRegion = {};
for (let p = 0; p < w * h; p++) {
  const a = data[p * 4 + 3];
  if (a >= 250) opaque++;
  else if (a <= 5) trans++;
  else {
    semi++;
    const x = p % w, y = (p / w) | 0;
    const region = `${Math.floor(x / (w / 4))},${Math.floor(y / (h / 4))}`;
    semiByRegion[region] = (semiByRegion[region] ?? 0) + 1;
  }
}
console.log({ w, h, opaque, semi, trans, total: w * h });
console.log("semi by region (col,row of 4x4 grid):", JSON.stringify(semiByRegion));