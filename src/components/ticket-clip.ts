/* ── ticket silhouette clip-path ──
   Zigzag torn edges on left & right short sides (perforated ticket stock),
   semicircle punches at top/bottom of the perforation line and mid-height of
   both outer edges. Percent coords are normalized against a 230×100 box so
   circles stay round at the ticket's 2.3:1 aspect ratio. */
export function ticketClip(splitPct: number): string {
  const W = 230, H = 100; // aspect-normalized coordinate space
  const teeth = 16;
  const amp = 2.4;        // zigzag depth (x units)
  const r = 5;            // punch radius (same units both axes → round)
  const pts: [number, number][] = [];
  const px = (splitPct / 100) * W;

  const arc = (cx: number, cy: number, from: number, to: number, step: number) => {
    for (let a = from; step > 0 ? a <= to : a >= to; a += step) {
      const rad = (a * Math.PI) / 180;
      pts.push([cx + r * Math.cos(rad), cy + r * Math.sin(rad)]);
    }
  };

  // top edge → notch down at perforation
  pts.push([amp, 0], [px - r, 0]);
  arc(px, 0, 180, 0, -30); // dips into ticket (y>0)
  pts.push([px + r, 0], [W, 0]);

  // right zigzag with mid punch (notch cuts leftward into ticket)
  const midR = H / 2;
  for (let i = 0; i <= teeth; i++) {
    const y = (i / teeth) * H;
    if (Math.abs(y - midR) < H / teeth / 2) {
      pts.push([W, midR - r]);
      arc(W, midR, -90, -270, -30); // leftward half-circle → inward notch
      pts.push([W, midR + r]);
    } else {
      pts.push([i % 2 === 0 ? W : W - amp, y]);
    }
  }

  // bottom edge ← notch up at perforation
  pts.push([px + r, H]);
  arc(px, H, 0, -180, -30); // dips upward into ticket (y<H)
  pts.push([px - r, H], [amp, H]);

  // left zigzag with mid punch (notch cuts rightward)
  for (let i = teeth; i >= 0; i--) {
    const y = (i / teeth) * H;
    if (Math.abs(y - midR) < H / teeth / 2) {
      pts.push([0, midR + r]);
      arc(0, midR, 90, -90, -30); // rightward half-circle → inward notch
      pts.push([0, midR - r]);
    } else {
      pts.push([i % 2 === 0 ? 0 : amp, y]);
    }
  }

  return `polygon(${pts.map(([x, y]) => `${(x / W) * 100}% ${y}%`).join(", ")})`;
}