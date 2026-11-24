import { useMemo } from "react";
import type { TicketSpec } from "../types";
import { rng } from "../data";
import { Tape } from "./decor";
import { ExpoTicket, FlowerTicket, GridTicket, SymphonyTicket } from "./tickets";

const VARIANT_COMPONENT = {
  symphony: SymphonyTicket,
  expo: ExpoTicket,
  flower: FlowerTicket,
  grid: GridTicket,
} as const;

export function TicketCard({ spec, onOpen }: { spec: TicketSpec; onOpen: (s: TicketSpec) => void }) {
  const { rotate, tapeCorner } = useMemo(() => {
    const r = rng(spec.seed ^ 0xc011a9e);
    return { rotate: -4 + r() * 8, tapeCorner: (["tl", "tr", "bl", "br"] as const)[Math.floor(r() * 4)] };
  }, [spec.seed]);

  const Body = VARIANT_COMPONENT[spec.variant];

  return (
    <div className="ticket-slot">
      <Tape seed={spec.seed} palette={spec.palette} corner={tapeCorner} />
      <div
        className="ticket-wrap"
        style={{ transform: `rotate(${rotate}deg)` }}
        onClick={() => onOpen(spec)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(spec); } }}
        role="button"
        tabIndex={0}
        aria-label={`${spec.zhName} 演唱会门票详情`}
      >
        <Body spec={spec} />
      </div>
    </div>
  );
}