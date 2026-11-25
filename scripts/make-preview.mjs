// Compose a README preview contact sheet from generated ticket WebPs (no browser needed).
import sharp from "sharp";
import { readFileSync } from "node:fs";
import path from "node:path";

const DIR = path.resolve("public/tickets");
// curated set spanning all 4 variants + elements + personalities
const picks = [
  "furina", "hu-tao", "zhongli", "raiden",
  "klee", "venti", "ayaka", "nahida",
  "arlecchino", "neuvillette", "mavuika", "columbina",
];
const TW = 560, GAP = 26, COLS = 2, PAD = 40;
const thumbs = [];
for (const slug of picks) {
  const buf = await sharp(path.join(DIR, `${slug}.webp`)).resize(TW, null, { fit: "inside" }).toBuffer();
  const m = await sharp(buf).metadata();
  thumbs.push({ buf, w: m.width, h: m.height });
}
const rowH = Math.max(...thumbs.map((t) => t.h));
const rows = Math.ceil(thumbs.length / COLS);
const W = PAD * 2 + COLS * TW + (COLS - 1) * GAP;
const H = PAD * 2 + rows * rowH + (rows - 1) * GAP;
// corkboard background
const bg = await sharp({
  create: { width: W, height: H, channels: 3, background: "#d3c5ae" },
}).png().toBuffer();
const composites = thumbs.map((t, i) => {
  const col = i % COLS, row = Math.floor(i / COLS);
  return { input: t.buf, left: PAD + col * (TW + GAP), top: PAD + row * (rowH + GAP) };
});
await sharp(bg).composite(composites).jpeg({ quality: 88 }).toFile("docs/preview.jpg");
console.log(`preview.jpg ${W}x${H}`);