// Batch-generate chibi concert art for characters via codex CLI image_generation.
// Each character: Pinterest-style chibi reference is optional; the official icon anchors design.
// Output: public/art/<slug>-stage.png (white background, square). Skips existing files.
// Usage: node scripts/gen-art.mjs <slug> [slug...]   |   --all-missing
import { spawnSync } from "node:child_process";
import { existsSync as exists, mkdirSync as mkdir, readFileSync as read } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(".");
const ART = path.join(ROOT, "public/art");
mkdir(ART, { recursive: true });

const chars = JSON.parse(read("src/data/characters.json", "utf8"));
const bySlug = new Map(chars.map((c) => [c.slug, c]));

let slugs = process.argv.slice(2);
if (slugs.includes("--all-missing")) {
  slugs = [...bySlug.keys()].filter((s) => !exists(path.join(ART, `${s}-stage.png`)));
}
if (!slugs.length) {
  console.log("usage: node scripts/gen-art.mjs <slug...> | --all-missing");
  process.exit(1);
}

for (const slug of slugs) {
  const out = path.join(ART, `${slug}-stage.png`);
  if (exists(out)) { console.log(`skip ${slug} (exists)`); continue; }
  const c = bySlug.get(slug);
  const name = c?.name ?? slug;
  const icon = path.join(ROOT, "public/icons", `${slug}.png`);
  const prompt = `Use your image_generation tool to generate ONE image, then save it into this project.

Image spec:
- Subject: ${name} from Genshin Impact as a cute chibi character performing on a concert stage — holding a microphone or striking an idol performance pose, joyful expression, sparkles and music notes around.
- Character design MUST match the attached official icon: same hair color/style, eye color, outfit colors and signature accessories.
- Art style: flat cel-shaded anime sticker illustration, clean bold outlines, vibrant saturated colors, kawaii chibi proportions (big head, small body), vocaloid concert merch art style. NO text, NO watermark, NO logo.
- Background: pure solid white (#FFFFFF), full body visible, centered, generous margin. Square 1:1.

Steps:
1. Generate the image with the image generation tool.
2. Locate the generated file (tool result path, or newest file under C:\\Users\\flowerwine\\.codex\\generated_images).
3. Copy it to ${out} (convert to PNG if needed).
4. Reply with the final absolute path only.`;

  const args = ["exec", "--skip-git-repo-check", "-s", "workspace-write"];
  if (exists(icon)) args.push("-i", icon);
  args.push("--", prompt);
  console.log(`generating ${slug} ...`);
  // Windows: invoke node + codex.js directly — .cmd shims mangle multiline args.
  const codexJs = path.join(path.dirname(process.execPath), "node_modules", "@openai", "codex", "bin", "codex.js");
  const useJs = process.platform === "win32" && exists(codexJs);
  const cmd = useJs ? process.execPath : "codex";
  const finalArgs = useJs ? [codexJs, ...args] : args;
  const r = spawnSync(cmd, finalArgs, { cwd: ROOT, encoding: "utf8", shell: false, timeout: 600000 });
  if (exists(out)) console.log(`ok ${slug}`);
  else console.error(`FAILED ${slug}: ${(r.stderr || r.stdout || "").slice(-300)}`);
}