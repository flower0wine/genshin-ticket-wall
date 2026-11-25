// Compare a ticket WebP against the user's screenshot to understand the artifact.
import sharp from "sharp";
const shot = "C:/Users/flowerwine/.dsh/attachments/v1/objects/c5/c505decd411dc3b1ee7337ed49ecad8d0857eeefe627717dbe49d85cffdecd6d";
const m = await sharp(shot).metadata();
console.log("screenshot:", m.width, m.height);
// sample the main-area background region (right of stub, around character) in both
const webp = "public/tickets/ayaka.webp";
const wm = await sharp(webp).metadata();
console.log("webp:", wm.width, wm.height);
// extract a patch from the webp main area top-right (should be white bg with stars)
await sharp(webp).extract({ left: 600, top: 20, width: 200, height: 120 }).png().toFile("gen/ayaka-patch.png");
// extract same-ish region from screenshot (scaled): screenshot 923 wide vs webp 1000
await sharp(shot).extract({ left: 560, top: 20, width: 200, height: 120 }).png().toFile("gen/ayaka-shot-patch.png");
console.log("patches written");