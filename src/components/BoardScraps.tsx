import { useMemo } from "react";
import { CHARACTERS, fallbackIcon, rng, ticketSpec } from "../data";
import { ART_MANIFEST } from "../data/art-manifest";

/** Background scraps: grid papers, kraft cards, lyric strips — pinned under tickets. */
export function BoardScraps() {
  const items = useMemo(() => {
    const specs = CHARACTERS.slice(0, 12).map((c) => ticketSpec(c, ART_MANIFEST));
    const r = rng(0xb0a4d);
    const kinds = ["grid-paper", "kraft", "lyrics", "pink-card", "blue-dots", "grid-paper", "kraft", "lyrics"];
    return kinds.map((kind, i) => ({
      id: i, kind,
      left: `${(i % 2 === 0 ? -2 : 58) + r() * 30}%`,
      top: `${4 + i * 11 + r() * 5}%`,
      width: 130 + r() * 170,
      height: kind === "lyrics" ? 260 + r() * 120 : 90 + r() * 130,
      rot: -9 + r() * 18,
      stamp: specs[i % specs.length],
    }));
  }, []);

  const tapes = useMemo(() => {
    const r = rng(0x7a9e5);
    const colors = ["#e88f9a", "#7fb3d8", "#f0b429", "#9a6cf5", "#4fd0b0", "#e88f9a", "#7fb3d8", "#f4693f"];
    return colors.map((c, i) => ({
      id: i, color: c,
      kind: ["stripes", "dots", "zigzag"][Math.floor(r() * 3)],
      left: `${(i % 2 === 0 ? 2 : 66) + r() * 26}%`,
      top: `${9 + i * 11.5 + r() * 4}%`,
      rot: -40 + r() * 80,
    }));
  }, []);

  return (
    <>
      {items.map((s) => (
        <div
          key={s.id}
          className={`scrap ${s.kind}`}
          style={{
            left: s.left, top: s.top, width: s.width, height: s.height,
            transform: `rotate(${s.rot}deg)`,
          }}
          aria-hidden
        >
          {s.kind === "lyrics" && (
            <span>
              その声を聴かせて　永遠の舞台で　光の粒が舞う夜に　君の名前を呼ぶよ　幕が上がる前に　心臓の音が高鳴る
            </span>
          )}
        </div>
      ))}
      {tapes.map((t) => (
        <div
          key={t.id}
          className={`board-tape ${t.kind}`}
          style={{ left: t.left, top: t.top, transform: `rotate(${t.rot}deg)`, ["--tape-a" as string]: t.color }}
          aria-hidden
        />
      ))}
      {/* two round character badges pinned on the board, like the TETO circle stamp */}
      {[CHARACTERS[3], CHARACTERS[7]].map((c, i) => {
        const spec = ticketSpec(c, ART_MANIFEST);
        return (
          <div
            key={c.slug}
            className="board-stamp"
            style={{
              width: 92, height: 92,
              left: i === 0 ? "1.5%" : "88%",
              top: i === 0 ? "16%" : "58%",
              transform: `rotate(${i === 0 ? -10 : 8}deg)`,
            }}
            aria-hidden
          >
            <img src={spec.iconSrc} alt="" loading="lazy"
              onError={(e) => { e.currentTarget.src = fallbackIcon(c); }} />
            <span>{c.name.toUpperCase().slice(0, 10)}</span>
          </div>
        );
      })}
    </>
  );
}