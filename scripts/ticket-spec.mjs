// Node port of src/data/index.ts ticket-spec logic, so generated ticket text
// matches the data-driven CSS fallback and the detail modal exactly.
import { readFileSync } from "node:fs";

export const VISION_PALETTES = {
  Pyro:    { base: "#f4693f", deep: "#8f2318", accent: "#ffc857", ink: "#fff6ec", tint: "#ffd9c4" },
  Hydro:   { base: "#3fa9f4", deep: "#1d3a8f", accent: "#7fe3ff", ink: "#f2fbff", tint: "#c9ecff" },
  Anemo:   { base: "#4fd0b0", deep: "#1e7a68", accent: "#d8ffe9", ink: "#f0fff9", tint: "#c8f5e6" },
  Electro: { base: "#9a6cf5", deep: "#4a2a8f", accent: "#ffd6f2", ink: "#faf4ff", tint: "#e4d5ff" },
  Dendro:  { base: "#7fc23f", deep: "#3c6e1e", accent: "#eaffb0", ink: "#f7ffee", tint: "#ddf2bb" },
  Cryo:    { base: "#7fd4e8", deep: "#2a6e8f", accent: "#ffffff", ink: "#f2fcff", tint: "#dcf6fc" },
  Geo:     { base: "#f0b429", deep: "#8f5f14", accent: "#fff1c4", ink: "#fffaf0", tint: "#ffe9ad" },
};
const FALLBACK = { base: "#d8cdbb", deep: "#6e6353", accent: "#fff6e6", ink: "#fffdf7", tint: "#efe7d8" };
export const paletteFor = (v) => VISION_PALETTES[v] ?? FALLBACK;

export function hashSeed(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const VARIANTS = ["symphony", "expo", "flower", "grid"];
const GATES = ["A", "B", "C", "D", "E", "F", "G"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function loadCharacters() {
  const base = JSON.parse(readFileSync("src/data/characters.json", "utf8"));
  // Extras live in zh-names.ts as a plain object-literal array; extract & eval it.
  const src = readFileSync("src/data/zh-names.ts", "utf8");
  const m = src.match(/EXTRA_CHARACTERS[^=]*=\s*(\[[\s\S]*?\n\]);/);
  let extras = [];
  if (m) extras = new Function(`return ${m[1]};`)();
  const seen = new Set(base.map((c) => c.slug));
  for (const e of extras) if (!seen.has(e.slug)) { base.push(e); seen.add(e.slug); }
  return base;
}

export function loadZhNames() {
  const src = readFileSync("src/data/zh-names.ts", "utf8");
  const m = src.match(/ZH_NAMES[^=]*=\s*(\{[\s\S]*?\n\});/);
  return m ? new Function(`return ${m[1]};`)() : {};
}

export function specFor(c) {
  const seed = hashSeed(c.slug);
  const r = rng(seed);
  const variant = VARIANTS[Math.floor(r() * VARIANTS.length)];
  let showDate;
  if (c.birthday && !c.birthday.startsWith("0000-00")) {
    const [, m, d] = c.birthday.split("-").map(Number);
    showDate = new Date(Date.UTC(2026, m - 1, d, 18, 30));
  } else if (c.release) {
    showDate = new Date(`${c.release}T18:30:00Z`);
  } else {
    showDate = new Date(Date.UTC(2026, Math.floor(r() * 12), 1 + Math.floor(r() * 28), 18, 30));
  }
  const serial = `No.${String(seed % 100000000).padStart(8, "0")}`;
  const y = showDate.getUTCFullYear();
  const mo = String(showDate.getUTCMonth() + 1).padStart(2, "0");
  const da = String(showDate.getUTCDate()).padStart(2, "0");
  return {
    seed, variant,
    palette: paletteFor(c.vision),
    serial,
    dateStr: `${y} ${mo} ${da}`,
    dateCompact: `${y}.${mo}`,
    weekday: WEEKDAYS[showDate.getUTCDay()],
    time: variant === "grid" ? "17:00" : "18:30",
    gate: GATES[Math.floor(r() * GATES.length)],
    row: String.fromCharCode(65 + Math.floor(r() * 12)),
    seat: String(1 + Math.floor(r() * 49)).padStart(2, "0"),
  };
}