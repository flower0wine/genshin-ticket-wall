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

  const open = () => onOpen(spec);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
  };

  // Generated whole-ticket illustration: display as a cut-out image with the
  // same collage treatment (rotation, tape, shadow). Falls back to CSS ticket.
  if (spec.ticketImg) {
    return (
      <div className="ticket-slot">
        <Tape seed={spec.seed} palette={spec.palette} corner={tapeCorner} />
        <div
          className="ticket-wrap ticket-img-wrap"
          style={{ transform: `rotate(${rotate}deg)` }}
          onClick={open}
          onKeyDown={onKey}
          role="button"
          tabIndex={0}
          aria-label={`${spec.zhName} 演唱会门票详情`}
        >
          <div className="ticket-shadow" />
          <img className="ticket-img" src={spec.ticketImg} alt={`${spec.zhName} 演唱会门票`} loading="lazy" />
        </div>
      </div>
    );
  }

  const Body = VARIANT_COMPONENT[spec.variant];
  return (
    <div className="ticket-slot">
      <Tape seed={spec.seed} palette={spec.palette} corner={tapeCorner} />
      <div
        className="ticket-wrap"
        style={{ transform: `rotate(${rotate}deg)` }}
        onClick={open}
        onKeyDown={onKey}
        role="button"
        tabIndex={0}
        aria-label={`${spec.zhName} 演唱会门票详情`}
      >
        <Body spec={spec} />
      </div>
    </div>
  );
}