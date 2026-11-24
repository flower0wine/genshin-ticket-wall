export type Vision =
  | "Pyro" | "Hydro" | "Anemo" | "Electro"
  | "Dendro" | "Cryo" | "Geo" | "";

export interface Character {
  slug: string;
  name: string;
  title: string;
  vision: Vision | string;
  weapon: string;
  nation: string;
  affiliation: string;
  rarity: number;
  release: string | null;
  constellation: string;
  birthday: string | null; // "0000-10-13"
  description: string;
}

/** Ticket layout variants, mirroring the reference collage's four ticket styles. */
export type TicketVariant = "symphony" | "expo" | "flower" | "grid";

export interface Palette {
  /** main ticket body background */
  base: string;
  /** darker companion (stub / banner) */
  deep: string;
  /** accent for tapes, sparkles, decorations */
  accent: string;
  /** text color on base */
  ink: string;
  /** soft tint for pattern fills */
  tint: string;
}

export interface TicketSpec {
  character: Character;
  zhName: string;
  variant: TicketVariant;
  palette: Palette;
  /** deterministic pseudo-random seed derived from slug */
  seed: number;
  serial: string;
  showDate: Date;
  gate: string;
  row: string;
  seat: string;
  artSrc: string | null;
  iconSrc: string;
}