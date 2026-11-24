import raw from "./characters.json";
import { EXTRA_CHARACTERS, ZH_NAMES } from "./zh-names";
import type { Character, Palette, TicketSpec, TicketVariant, Vision } from "../types";

export const CHARACTERS: Character[] = [...(raw as Character[]), ...EXTRA_CHARACTERS];

export const zhName = (c: Character): string => ZH_NAMES[c.slug] ?? c.name;

/** Element palettes tuned to the reference collage's saturated flat-print look. */
export const VISION_PALETTES: Record<Exclude<Vision, "">, Palette> = {
  Pyro:    { base: "#f4693f", deep: "#8f2318", accent: "#ffc857", ink: "#fff6ec", tint: "#ffd9c4" },
  Hydro:   { base: "#3fa9f4", deep: "#1d3a8f", accent: "#7fe3ff", ink: "#f2fbff", tint: "#c9ecff" },
  Anemo:   { base: "#4fd0b0", deep: "#1e7a68", accent: "#d8ffe9", ink: "#f0fff9", tint: "#c8f5e6" },
  Electro: { base: "#9a6cf5", deep: "#4a2a8f", accent: "#ffd6f2", ink: "#faf4ff", tint: "#e4d5ff" },
  Dendro:  { base: "#7fc23f", deep: "#3c6e1e", accent: "#eaffb0", ink: "#f7ffee", tint: "#ddf2bb" },
  Cryo:    { base: "#7fd4e8", deep: "#2a6e8f", accent: "#ffffff", ink: "#f2fcff", tint: "#dcf6fc" },
  Geo:     { base: "#f0b429", deep: "#8f5f14", accent: "#fff1c4", ink: "#fffaf0", tint: "#ffe9ad" },
};

const FALLBACK_PALETTE: Palette = {
  base: "#d8cdbb", deep: "#6e6353", accent: "#fff6e6", ink: "#fffdf7", tint: "#efe7d8",
};

export const paletteFor = (vision: string): Palette =>
  VISION_PALETTES[vision as Exclude<Vision, "">] ?? FALLBACK_PALETTE;

/** Inline SVG placeholder for characters without an official icon (newer releases).
    Returns a data URI so it works offline and on any host without extra assets. */
export function fallbackIcon(c: Character): string {
  const p = paletteFor(c.vision);
  const letter = (c.name[0] ?? "?").toUpperCase();
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='${p.base}'/><stop offset='1' stop-color='${p.deep}'/>` +
    `</linearGradient></defs>` +
    `<circle cx='64' cy='64' r='62' fill='url(#g)'/>` +
    `<circle cx='64' cy='64' r='56' fill='none' stroke='${p.accent}' stroke-width='2' stroke-dasharray='4 5'/>` +
    `<text x='64' y='78' font-family='Georgia,serif' font-size='56' font-weight='700' fill='${p.ink}' text-anchor='middle'>${letter}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** FNV-1a — stable seed so every ticket keeps its layout across renders/builds. */
export function hashSeed(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 PRNG */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const VARIANTS: TicketVariant[] = ["symphony", "expo", "flower", "grid"];
const GATES = ["A", "B", "C", "D", "E", "F", "G"];

/** Deterministically derive the whole ticket spec from character data. */
export function ticketSpec(
  c: Character,
  artManifest: Record<string, string>,
  ticketManifest: Record<string, string> = {},
): TicketSpec {
  const seed = hashSeed(c.slug);
  const r = rng(seed);
  const variant = VARIANTS[Math.floor(r() * VARIANTS.length)];

  // Show date: birthday when known, otherwise release date, otherwise seeded 2026 date.
  // Grid variant doors at 17:00, others 18:30 (matches ticket art + CSS fallback).
  const hour = variant === "grid" ? 17 : 18;
  let showDate: Date;
  if (c.birthday && !c.birthday.startsWith("0000-00")) {
    const [, m, d] = c.birthday.split("-").map(Number);
    showDate = new Date(Date.UTC(2026, m - 1, d, hour, 30));
  } else if (c.release) {
    showDate = new Date(`${c.release}T${String(hour).padStart(2, "0")}:30:00Z`);
  } else {
    showDate = new Date(Date.UTC(2026, Math.floor(r() * 12), 1 + Math.floor(r() * 28), hour, 30));
  }

  const serial = `No.${String(seed % 100000000).padStart(8, "0")}`;
  return {
    character: c,
    zhName: zhName(c),
    variant,
    palette: paletteFor(c.vision),
    seed,
    serial,
    showDate,
    gate: GATES[Math.floor(r() * GATES.length)],
    row: String.fromCharCode(65 + Math.floor(r() * 12)),
    seat: String(1 + Math.floor(r() * 49)).padStart(2, "0"),
    artSrc: artManifest[c.slug] ?? null,
    iconSrc: `${import.meta.env.BASE_URL}icons/${c.slug}.png`,
    ticketImg: ticketManifest[c.slug] ?? null,
  };
}