// Download official character icons (fallback art) from genshindev/api into public/icons.
// Usage: node scripts/fetch-icons.mjs [slug...]   (no args = all slugs in src/data/characters.json)
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { readFile } from "node:fs/promises";

const OUT = path.resolve("public/icons");
await mkdir(OUT, { recursive: true });

const chars = JSON.parse(await readFile("src/data/characters.json", "utf8"));
const wanted = process.argv.slice(2);
const slugs = wanted.length ? wanted : chars.map((c) => c.slug);

let ok = 0, skip = 0, fail = 0;
for (const slug of slugs) {
  const dest = path.join(OUT, `${slug}.png`);
  try { await access(dest); skip++; continue; } catch { /* not cached */ }
  const url = `https://raw.githubusercontent.com/genshindev/api/master/assets/images/characters/${slug}/icon-big`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(dest, buf);
    ok++;
  } catch (e) {
    console.warn(`fail ${slug}: ${e.message}`);
    fail++;
  }
}
console.log(`icons: ${ok} downloaded, ${skip} cached, ${fail} failed`);