import { useMemo } from "react";
import type { TicketSpec } from "../types";
import { rng } from "../data";

/** Deterministic decorative sparkles / petals / notes scattered on the ticket. */
export function Sparkles({ spec, count = 8 }: { spec: TicketSpec; count?: number }) {
  const items = useMemo(() => {
    const r = rng(spec.seed ^ 0x5eed);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 4 + r() * 92,
      y: 6 + r() * 88,
      size: 7 + r() * 13,
      rot: r() * 360,
      kind: Math.floor(r() * 3),
      opacity: 0.5 + r() * 0.5,
    }));
  }, [spec.seed, count]);

  return (
    <>
      {items.map((s) => (
        <svg
          key={s.id}
          className="sparkle"
          style={{
            left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size,
            transform: `rotate(${s.rot}deg)`, opacity: s.opacity,
          }}
          viewBox="0 0 24 24"
          aria-hidden
        >
          {s.kind === 0 && (
            <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill={spec.palette.accent} />
          )}
          {s.kind === 1 && (
            <path d="M12 2 C17 7 19 12 12 22 C5 12 7 7 12 2 Z" fill={spec.palette.tint} />
          )}
          {s.kind === 2 && (
            <path d="M9 3 v12.5 a3.5 3 0 1 1 -2 -2.7 V6 l10 -2.5 v10 a3.5 3 0 1 1 -2 -2.7 V3 Z" fill={spec.palette.accent} />
          )}
        </svg>
      ))}
    </>
  );
}

/** CSS-gradient barcode with serial underneath. */
export function Barcode({ serial, color, vertical = false }: { serial: string; color: string; vertical?: boolean }) {
  return (
    <div
      style={{
        display: "flex", flexDirection: vertical ? "row" : "column",
        alignItems: "center", gap: 3, color,
      }}
    >
      <div
        className="barcode"
        style={vertical
          ? { width: 16, height: 86, transform: "rotate(90deg)", transformOrigin: "center" }
          : { width: "100%", height: 22 }}
      />
      {!vertical && serial && (
        <span className="t-cond" style={{ fontSize: 8, letterSpacing: "0.18em" }}>{serial}</span>
      )}
    </div>
  );
}

/** White barcode blocks stacked on a colored stub — reference TETO style. */
export function BarcodeBlocks({ rows = 4, width = "72%" }: { rows?: number; width?: string }) {
  return (
    <div className="barcode-blocks" style={{ width }}>
      {Array.from({ length: rows }, (_, i) => <i key={i} />)}
    </div>
  );
}

/** Round ink stamp with rough edge mask. */
export function Stamp({ text, color, size = 74, style }: { text: string; color: string; size?: number; style?: React.CSSProperties }) {
  return (
    <div className="stamp" style={{ width: size, height: size, color, fontSize: size / 7.5, ...style }}>
      <div style={{ padding: 6, lineHeight: 1.25 }}>{text}</div>
    </div>
  );
}

/** ◆◆◆ separator used across the reference tickets. */
export function Diamonds({ color, style }: { color: string; style?: React.CSSProperties }) {
  return <div className="diamonds" style={{ color, ...style }} aria-hidden>◆◆◆</div>;
}

/** Washi tape strip pinned over a ticket corner. */
export function Tape({ seed, palette, corner }: { seed: number; palette: { accent: string; deep: string; base: string }; corner: "tl" | "tr" | "bl" | "br" }) {
  const r = rng(seed ^ 0x7a9e);
  const kind = ["stripes", "dots", "plain"][Math.floor(r() * 3)];
  const angle = (corner === "tl" || corner === "br" ? -1 : 1) * (28 + r() * 22);
  const pos: React.CSSProperties =
    corner === "tl" ? { top: -12, left: -26 } :
    corner === "tr" ? { top: -12, right: -26 } :
    corner === "bl" ? { bottom: -12, left: -26 } :
    { bottom: -12, right: -26 };
  return (
    <div
      className={`tape ${kind}`}
      style={{ ...pos, transform: `rotate(${angle}deg)`, ["--tape-a" as string]: r() > 0.5 ? palette.deep : palette.base }}
      aria-hidden
    />
  );
}
