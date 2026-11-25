// Check if transparent pixels exist INSIDE the ticket bounding box (the bug).
import sharp from "sharp";
const { data, info } = await sharp("public/tickets/ayaka.webp").ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
// find bounding box of opaque pixels
let minX = w, maxX = 0, minY = h, maxY = 0;
for (let p = 0; p < w * h; p++) {
  if (data[p * 4 + 3] >= 128) {
    const x = p % w, y = (p / w) | 0;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
}
console.log("opaque bbox:", { minX, maxX, minY, maxY });
// count transparent pixels strictly inside bbox (excluding a 3px edge band)
let insideTrans = 0;
const samples = [];
for (let y = minY + 3; y < maxY - 3; y++) {
  for (let x = minX + 3; x < maxX - 3; x++) {
    const p = y * w + x;
    if (data[p * 4 + 3] < 128) {
      insideTrans++;
      if (samples.length < 10) samples.push([x, y]);
    }
  }
}
console.log("transparent inside bbox:", insideTrans, "samples:", JSON.stringify(samples));