// Visualize transparent pixels INSIDE the ticket bbox as red overlay.
import sharp from "sharp";
const { data, info } = await sharp("public/tickets/ayaka.webp").ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
let minX = w, maxX = 0, minY = h, maxY = 0;
for (let p = 0; p < w * h; p++) if (data[p * 4 + 3] >= 128) {
  const x = p % w, y = (p / w) | 0;
  if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
}
// build RGB image: original where opaque, red where transparent-inside-bbox, gray elsewhere
const out = Buffer.alloc(w * h * 3);
for (let p = 0; p < w * h; p++) {
  const a = data[p * 4 + 3];
  const x = p % w, y = (p / w) | 0;
  const inside = x > minX + 2 && x < maxX - 2 && y > minY + 2 && y < maxY - 2;
  if (a >= 128) { out[p*3]=data[p*4]; out[p*3+1]=data[p*4+1]; out[p*3+2]=data[p*4+2]; }
  else if (inside) { out[p*3]=255; out[p*3+1]=0; out[p*3+2]=0; }
  else { out[p*3]=200; out[p*3+1]=200; out[p*3+2]=200; }
}
await sharp(out, { raw: { width: w, height: h, channels: 3 } }).png().toFile("gen/ayaka-holes.png");
console.log("written gen/ayaka-holes.png (red = removed content inside ticket)");