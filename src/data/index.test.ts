import { describe, expect, it } from "vitest";
import { CHARACTERS, hashSeed, paletteFor, rng, ticketSpec, zhName } from "./index";

describe("data layer", () => {
  it("has the full roster (>= 120 characters incl. extras)", () => {
    expect(CHARACTERS.length).toBeGreaterThanOrEqual(120);
    const slugs = new Set(CHARACTERS.map((c) => c.slug));
    expect(slugs.size).toBe(CHARACTERS.length); // no duplicates
    expect(slugs.has("furina")).toBe(true);
    expect(slugs.has("columbina")).toBe(true);
  });

  it("every character has a Chinese display name", () => {
    for (const c of CHARACTERS) {
      expect(zhName(c), c.slug).not.toBe("");
    }
    expect(zhName(CHARACTERS.find((c) => c.slug === "furina")!)).toBe("芙宁娜");
  });

  it("hashSeed is deterministic and rng reproducible", () => {
    expect(hashSeed("furina")).toBe(hashSeed("furina"));
    const a = rng(42), b = rng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("ticketSpec is stable across calls", () => {
    const c = CHARACTERS.find((x) => x.slug === "hu-tao")!;
    const s1 = ticketSpec(c, {});
    const s2 = ticketSpec(c, {});
    expect(s1).toEqual(s2);
    expect(s1.serial).toMatch(/^No\.\d{8}$/);
    expect(["symphony", "expo", "flower", "grid"]).toContain(s1.variant);
  });

  it("birthday drives show date when known", () => {
    const furina = CHARACTERS.find((c) => c.slug === "furina")!;
    const spec = ticketSpec(furina, {});
    expect(spec.showDate.getUTCMonth() + 1).toBe(10);
    expect(spec.showDate.getUTCDate()).toBe(13);
  });

  it("palette falls back for visionless traveler", () => {
    expect(paletteFor("").base).toBe("#d8cdbb");
    expect(paletteFor("Hydro").deep).toBe("#1d3a8f");
  });
});