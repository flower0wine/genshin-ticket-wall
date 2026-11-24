// Print missing ticket slugs split into N disjoint chunks (round-robin).
import { existsSync as exists } from "node:fs";
import path from "node:path";
import { loadCharacters } from "./ticket-spec.mjs";

const OUT = path.resolve("public/tickets");
const N = Number(process.argv[2] ?? 4);
const missing = loadCharacters().map((c) => c.slug).filter((s) =>
  !exists(path.join(OUT, `${s}.webp`)) && !exists(path.join(OUT, `${s}.png`)));

const chunks = Array.from({ length: N }, () => []);
missing.forEach((s, i) => chunks[i % N].push(s));
chunks.forEach((ch, i) => console.log(`CHUNK${i}: ${ch.join(" ")}`));
console.error(`total missing: ${missing.length}`);