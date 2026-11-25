// Composite ayaka.webp over cork color to reproduce the deployed appearance.
import sharp from "sharp";
const W = 1000, H = 435;
const cork = await sharp({ create: { width: W, height: H, channels: 3, background: "#d3c5ae" } }).png().toBuffer();
await sharp(cork).composite([{ input: "public/tickets/ayaka.webp", top: 0, left: 0 }]).png().toFile("gen/ayaka-on-cork.png");
console.log("written gen/ayaka-on-cork.png");