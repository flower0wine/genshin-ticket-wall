// Batch-generate whole concert-ticket illustrations via codex image_generation.
// Each ticket: style anchored to the reference collage + official character icon.
// Output: public/tickets/<slug>.png (white bg). Run process-tickets.mjs after.
// Usage: node scripts/gen-tickets.mjs <slug> [slug...]  |  --all-missing  |  --list
import { spawnSync } from "node:child_process";
import { existsSync as exists, mkdirSync as mkdir } from "node:fs";
import path from "node:path";
import { loadCharacters, loadZhNames, specFor } from "./ticket-spec.mjs";
import { buildPrompt } from "./ticket-prompts.mjs";

const ROOT = path.resolve(".");
const OUT = path.join(ROOT, "public/tickets");
mkdir(OUT, { recursive: true });
const REF = path.join(ROOT, "refs/reference-collage.png");

const chars = loadCharacters();
const zh = loadZhNames();
const bySlug = new Map(chars.map((c) => [c.slug, c]));

let slugs = process.argv.slice(2);
if (slugs.includes("--list")) {
  for (const c of chars) {
    const done = exists(path.join(OUT, `${c.slug}.webp`)) || exists(path.join(OUT, `${c.slug}.png`));
    console.log(`${done ? "x" : " "} ${c.slug} (${specFor(c).variant})`);
  }
  process.exit(0);
}
if (slugs.includes("--all-missing")) {
  slugs = chars.map((c) => c.slug).filter((s) =>
    !exists(path.join(OUT, `${s}.webp`)) && !exists(path.join(OUT, `${s}.png`)));
}
if (!slugs.length) {
  console.log("usage: node scripts/gen-tickets.mjs <slug...> | --all-missing | --list");
  process.exit(1);
}

const codexJs = path.join(path.dirname(process.execPath), "node_modules", "@openai", "codex", "bin", "codex.js");
const useJs = process.platform === "win32" && exists(codexJs);

let ok = 0, fail = 0;
for (const slug of slugs) {
  const out = path.join(OUT, `${slug}.png`);
  if (exists(out) || exists(path.join(OUT, `${slug}.webp`))) { console.log(`skip ${slug} (exists)`); continue; }
  const c = bySlug.get(slug);
  if (!c) { console.error(`unknown slug ${slug}`); fail++; continue; }
  const s = specFor(c);
  const icon = path.join(ROOT, "public/icons", `${slug}.png`);
  const hasIcon = exists(icon);
  const prompt = buildPrompt(c, s, zh[slug] ?? c.name, out, hasIcon);

  const args = ["exec", "--skip-git-repo-check", "-s", "workspace-write", "-i", REF];
  if (hasIcon) args.push("-i", icon);
  args.push("--", prompt);
  const cmd = useJs ? process.execPath : "codex";
  const finalArgs = useJs ? [codexJs, ...args] : args;
  console.log(`generating ${slug} (${s.variant}) ...`);
  // stdio:"ignore" so spawnSync never blocks on lingering grandchild stdio;
  // hard timeout + SIGKILL; retry once if the file did not land.
  let produced = false;
  for (let attempt = 1; attempt <= 2 && !produced; attempt++) {
    spawnSync(cmd, finalArgs, {
      cwd: ROOT, shell: false, stdio: "ignore",
      timeout: 300000, killSignal: "SIGKILL",
    });
    produced = exists(out);
    if (!produced && attempt === 1) console.log(`retry ${slug} ...`);
  }
  if (produced) { console.log(`ok ${slug}`); ok++; }
  else { console.error(`FAILED ${slug}`); fail++; }
}
console.log(`done: ${ok} ok, ${fail} failed`);