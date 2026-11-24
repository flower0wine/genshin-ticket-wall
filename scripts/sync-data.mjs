// Sync character metadata from genshindev/api (GitHub raw) into src/data/characters.json.
// Only fields the ticket wall needs are kept; Chinese display names come from zh-names.ts.
// Usage: node scripts/sync-data.mjs
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const RAW = "https://raw.githubusercontent.com/genshindev/api/master/assets/data/characters";
const OUT = path.resolve("src/data");

const listRes = await fetch(
  "https://api.github.com/repos/genshindev/api/contents/assets/data/characters",
);
if (!listRes.ok) throw new Error(`list failed: ${listRes.status}`);
const dirs = (await listRes.json()).filter((d) => d.type === "dir").map((d) => d.name);

const characters = [];
for (const slug of dirs) {
  const res = await fetch(`${RAW}/${slug}/en.json`);
  if (!res.ok) {
    console.warn(`skip ${slug}: ${res.status}`);
    continue;
  }
  const j = await res.json();
  characters.push({
    slug,
    name: j.name,
    title: j.title ?? "",
    vision: j.vision ?? "", // "" for traveler variants
    weapon: j.weapon ?? "",
    nation: j.nation ?? "",
    affiliation: j.affiliation ?? "",
    rarity: j.rarity ?? 4,
    release: j.release ?? null,
    constellation: j.constellation ?? "",
    birthday: j.birthday ?? null, // "0000-10-13"
    description: j.description ?? "",
  });
  console.log(`ok ${slug}`);
}

characters.sort((a, b) => (a.release ?? "").localeCompare(b.release ?? "") || a.slug.localeCompare(b.slug));
await mkdir(OUT, { recursive: true });
await writeFile(path.join(OUT, "characters.json"), JSON.stringify(characters, null, 2) + "\n");
console.log(`wrote ${characters.length} characters`);