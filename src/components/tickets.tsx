import { QRCodeSVG } from "qrcode.react";
import type { TicketSpec } from "../types";
import { fallbackIcon } from "../data";
import { Barcode, BarcodeBlocks, Diamonds, Sparkles } from "./decor";
import { ticketClip } from "./ticket-clip";

const fmtDate = (d: Date) =>
  `${d.getUTCFullYear()} ${String(d.getUTCMonth() + 1).padStart(2, "0")} ${String(d.getUTCDate()).padStart(2, "0")}`;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Overflowing character art with white sticker outline — breaks the frame. */
function OverflowArt({ spec, style }: { spec: TicketSpec; style?: React.CSSProperties }) {
  const generated = Boolean(spec.artSrc);
  return (
    <div className={`art-overflow ${generated ? "" : "icon"}`} style={style}>
      <img
        src={spec.artSrc ?? spec.iconSrc}
        alt={spec.zhName}
        loading="lazy"
        onError={(e) => { e.currentTarget.src = fallbackIcon(spec.character); }}
      />
    </div>
  );
}

/* ── Variant 1: "Symphony" ──
   pink-grid main + dark maroon stub, script logo bottom-right of stub,
   black title banner across lower main, art overflowing top edge. */
export function SymphonyTicket({ spec }: { spec: TicketSpec }) {
  const p = spec.palette;
  return (
    <div className="ticket">
      <div className="ticket-shadow" />
      <div className="ticket-shell" style={{ ["--ticket-clip" as string]: ticketClip(68) }}>
        <div className="main" style={{ background: `linear-gradient(135deg, ${p.tint}, ${p.base})` }}>
          <div style={{
            position: "absolute", inset: 0, opacity: 0.4,
            backgroundImage: `linear-gradient(${p.deep}26 1px, transparent 1px), linear-gradient(90deg, ${p.deep}26 1px, transparent 1px)`,
            backgroundSize: "17px 17px",
          }} />
          {/* scattered UI-ish rectangles like the reference's digital panels */}
          <div style={{ position: "absolute", left: "8%", top: "14%", width: "26%", height: "34%", border: `2px solid ${p.deep}55`, borderRadius: 3, opacity: 0.5 }} />
          <div style={{ position: "absolute", right: "10%", top: "22%", width: "18%", height: "26%", background: `${p.deep}22`, borderRadius: 3 }} />
          <Sparkles spec={spec} count={6} />
          <span className="t-cond" style={{ position: "absolute", top: 7, left: 14, fontSize: 9, letterSpacing: "0.18em", color: p.deep, zIndex: 4 }}>
            D:{spec.character.constellation.toUpperCase().slice(0, 22)}
          </span>
          {/* black title banner */}
          <div style={{
            position: "absolute", left: "-2%", right: "12%", bottom: "13%", zIndex: 5,
            background: "#1c1712", color: "#fdf9f0", padding: "6px 16px 7px",
            transform: "rotate(-1.2deg)", boxShadow: "0 4px 8px rgba(0,0,0,.35)",
          }}>
            <span className="t-serif" style={{ fontWeight: 800, fontSize: "clamp(16px, 2.3vw, 24px)", color: p.accent }}>
              {spec.character.name.split(" ")[0]}
            </span>
            <span className="t-serif" style={{ fontWeight: 800, fontSize: "clamp(16px, 2.3vw, 24px)", marginLeft: 8 }}>
              {spec.zhName}
            </span>
            <div className="t-script" style={{ fontSize: 13, opacity: 0.9, marginTop: 1 }}>
              {spec.character.nation} Special Live
            </div>
          </div>
        </div>

        <div className="stub" style={{ background: p.deep, color: p.ink, padding: "10px 14px" }}>
          <div className="t-cond" style={{ fontSize: 9, letterSpacing: "0.15em", opacity: 0.8, textAlign: "right" }}>{spec.serial}</div>
          <div className="t-serif" style={{ fontWeight: 800, fontSize: "clamp(15px, 2vw, 21px)", marginTop: 5 }}>
            {fmtDate(spec.showDate)}
          </div>
          <div className="t-cond" style={{ fontSize: 10, opacity: 0.85 }}>
            {WEEKDAYS[spec.showDate.getUTCDay()]} 18:30
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 9, alignItems: "baseline" }}>
            <span className="t-cond" style={{ fontSize: 9, letterSpacing: "0.15em", opacity: 0.7 }}>Row:</span>
            <span className="t-serif" style={{ fontSize: 19, fontWeight: 600, color: p.accent }}>{spec.row}</span>
            <span style={{ opacity: 0.5, margin: "0 3px" }}>|</span>
            <span className="t-cond" style={{ fontSize: 9, letterSpacing: "0.15em", opacity: 0.7 }}>Seat:</span>
            <span className="t-serif" style={{ fontSize: 19, fontWeight: 600, color: p.accent }}>{spec.seat}</span>
          </div>
          {/* script event logo, like "Electric Symphony" */}
          <div className="t-script" style={{
            position: "absolute", bottom: 10, left: 14, right: 10,
            fontSize: "clamp(17px, 2.3vw, 24px)", color: p.accent, lineHeight: 1.05,
            transform: "rotate(-2deg)",
          }}>
            “{spec.character.title.split(" ").slice(0, 3).join(" ") || spec.zhName}”
            <div className="t-cond" style={{ fontSize: 8, letterSpacing: "0.2em", color: p.ink, opacity: 0.75, marginTop: 3 }}>
              {spec.character.name.toUpperCase()} SPECIAL LIVE
            </div>
          </div>
        </div>

        <div className="perforation" />
      </div>
      {/* art breaks the top edge */}
      <OverflowArt spec={spec} style={{ left: "10%", top: "-26%", width: "48%", height: "124%" }} />
    </div>
  );
}

/* ── Variant 2: "Expo" ──
   colored left stub (QR + white barcode blocks + diamonds), white main with
   vertical date rail, gold stars, round stamp top-right, script name + bold EXPO. */
export function ExpoTicket({ spec }: { spec: TicketSpec }) {
  const p = spec.palette;
  return (
    <div className="ticket">
      <div className="ticket-shadow" />
      <div className="ticket-shell" style={{ ["--ticket-clip" as string]: ticketClip(32), flexDirection: "row" }}>
        <div className="stub" style={{
          flex: "0 0 32%", background: p.base, color: p.ink,
          padding: "9px 12px", display: "flex", flexDirection: "column",
        }}>
          <div className="t-cond" style={{ fontSize: 9, letterSpacing: "0.15em", opacity: 0.85 }}>{spec.serial.replace("No.", ".")}</div>
          <div className="t-cond" style={{ fontWeight: 700, fontSize: 13, marginTop: 2, letterSpacing: "0.08em", textAlign: "center" }}>
            ZONE: {spec.gate}<br />FREE STANDING
          </div>
          <Diamonds color={p.ink} style={{ textAlign: "center", margin: "3px 0" }} />
          <div className="qr" style={{ alignSelf: "center" }}>
            <QRCodeSVG value={`teyvat-live://${spec.character.slug}/${spec.serial}`} size={52} bgColor="#ffffff" fgColor="#1c1712" level="L" />
          </div>
          <div style={{ marginTop: "auto" }}>
            <div className="t-cond" style={{ fontWeight: 700, fontSize: 16, letterSpacing: "0.04em", lineHeight: 1.1 }}>
              {spec.character.name.toUpperCase().split(" ")[0].slice(0, 10)}
              <span style={{ fontSize: 10 }}>✦</span><br />
              <span style={{ fontSize: 12, letterSpacing: "0.14em" }}>EXPO</span>
            </div>
            <div className="t-cond" style={{ fontSize: 8, letterSpacing: "0.22em", opacity: 0.9 }}>2026 WORLDWIDE</div>
          </div>
        </div>

        <div className="main" style={{ flex: "1 1 68%", background: "#fdfbf5" }}>
          {/* vertical date rail + white barcode blocks on colored strip */}
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 34,
            background: p.base, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span className="t-cond" style={{
              writingMode: "vertical-rl", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.1em", color: p.ink,
            }}>
              {fmtDate(spec.showDate)} 18:30
            </span>
          </div>
          <div style={{ position: "absolute", left: 40, top: "12%", width: 26 }}>
            <BarcodeBlocks rows={5} width="100%" />
          </div>
          <Sparkles spec={spec} count={10} />
          {/* black round badge top-right, like the TETO diamond badge */}
          <div style={{
            position: "absolute", top: 8, right: 10, width: 62, height: 74, zIndex: 5,
            background: "#1c1712", color: "#fdf9f0", borderRadius: 4,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <Diamonds color="#fdf9f0" style={{ fontSize: 6 }} />
            <div style={{
              width: 40, height: 40, borderRadius: "50%", border: "1.5px solid #fdf9f0",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "3px 0",
              overflow: "hidden",
            }}>
              <img src={spec.iconSrc} alt=""
                onError={(e) => { e.currentTarget.src = fallbackIcon(spec.character); }}
                style={{ width: "88%", height: "88%", borderRadius: "50%", objectFit: "cover" }} />
            </div>
            <span className="t-cond" style={{ fontSize: 6.5, letterSpacing: "0.1em" }}>./projectTEYVAT</span>
            <Diamonds color="#fdf9f0" style={{ fontSize: 6 }} />
          </div>
          {/* script name + bold expo wordmark */}
          <div style={{ position: "absolute", right: 14, bottom: 30, textAlign: "right", zIndex: 5 }}>
            <div className="t-script" style={{ fontSize: "clamp(18px, 2.6vw, 27px)", color: p.base, transform: "rotate(-2deg)" }}>
              {spec.character.name}
            </div>
            <div className="t-cond" style={{ fontWeight: 700, fontSize: "clamp(14px, 2vw, 20px)", color: "#241f18", letterSpacing: "0.04em" }}>
              {spec.zhName} <span style={{ color: p.base }}>EXPO</span><span style={{ fontSize: 11 }}>✦</span>
            </div>
            <div className="t-cond" style={{ fontSize: 9, letterSpacing: "0.3em", color: "#6e6353" }}>2026 WORLDWIDE</div>
          </div>
          <div style={{ position: "absolute", right: 14, bottom: 7, width: 96 }}>
            <Barcode serial={spec.serial} color="#241f18" />
          </div>
        </div>

        <div className="perforation dark" style={{ left: "32%" }} />
      </div>
      {/* art bursts above the ticket, hand raised like reference Teto */}
      <OverflowArt spec={spec} style={{ left: "30%", top: "-30%", width: "44%", height: "128%" }} />
    </div>
  );
}

/* ── Variant 3: "Flower" ──
   gradient main with petals, ADMIT ONE rail on stub, elegant serif stub text,
   diagonal name ribbon, art overflowing top-left. */
export function FlowerTicket({ spec }: { spec: TicketSpec }) {
  const p = spec.palette;
  return (
    <div className="ticket">
      <div className="ticket-shadow" />
      <div className="ticket-shell" style={{ ["--ticket-clip" as string]: ticketClip(68) }}>
        <div className="main" style={{ background: `linear-gradient(160deg, ${p.base}, ${p.deep})` }}>
          <Sparkles spec={spec} count={13} />
          {/* dotted arc trail like reference */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5 }} viewBox="0 0 230 100" preserveAspectRatio="none" aria-hidden>
            <path d="M 150 20 Q 190 45 165 80" fill="none" stroke={p.accent} strokeWidth="1.6" strokeDasharray="0.5 5" strokeLinecap="round" />
          </svg>
          <span className="t-cond" style={{
            position: "absolute", left: 10, top: 0, bottom: 0, writingMode: "vertical-rl",
            display: "flex", alignItems: "center", fontSize: 9, letterSpacing: "0.2em", color: `${p.ink}dd`, zIndex: 4,
          }}>
            {spec.serial}
          </span>
          <span className="t-cond" style={{ position: "absolute", right: 8, top: 6, fontSize: 8, letterSpacing: "0.12em", color: `${p.ink}bb`, zIndex: 4 }}>
            ./projectTEYVAT2026
          </span>
          {/* diagonal name ribbon */}
          <div style={{
            position: "absolute", left: "30%", right: "-4%", bottom: "16%", zIndex: 5,
            background: `${p.deep}f2`, color: p.ink, padding: "5px 18px",
            transform: "rotate(-4deg)", boxShadow: "0 4px 9px rgba(0,0,0,.32)",
          }}>
            <span className="t-script" style={{ fontSize: "clamp(19px, 2.8vw, 29px)", color: p.accent }}>
              ✶ {spec.character.name}
            </span>
            <div className="t-cond" style={{ fontSize: 9, letterSpacing: "0.24em", marginTop: 1 }}>
              WORLD TOUR 2026
            </div>
          </div>
          <div style={{ position: "absolute", left: 28, bottom: 9, width: 64, opacity: 0.9 }}>
            <BarcodeBlocks rows={3} width="100%" />
          </div>
        </div>

        <div className="stub" style={{ background: p.deep, color: p.ink, display: "flex" }}>
          <div className="t-cond" style={{
            flex: "0 0 32px", writingMode: "vertical-rl", transform: "rotate(180deg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 13, letterSpacing: "0.3em",
            borderRight: `1.5px dashed ${p.ink}66`,
          }}>
            ✶ ADMIT ONE ✶
          </div>
          <div style={{ flex: 1, padding: "9px 12px", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="t-cond" style={{ fontSize: 9, opacity: 0.75, letterSpacing: "0.12em" }}>World Tour</span>
              <span className="t-serif" style={{ fontWeight: 800, fontSize: 15 }}>{spec.showDate.getUTCFullYear()}</span>
            </div>
            <div className="t-script" style={{ fontSize: "clamp(20px, 2.8vw, 29px)", color: p.accent, lineHeight: 1.05, transform: "rotate(-1.5deg)" }}>
              {spec.zhName}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 7 }}>
              {[["GATE", spec.gate], ["ROW", spec.row], ["SEAT", spec.seat]].map(([k, v]) => (
                <div key={k}>
                  <div className="t-cond" style={{ fontSize: 7.5, letterSpacing: "0.2em", opacity: 0.7 }}>{k}</div>
                  <div className="t-serif" style={{ fontSize: 18, fontWeight: 800 }}>{v}</div>
                </div>
              ))}
            </div>
            <Diamonds color={p.accent} style={{ position: "absolute", bottom: 8, left: 12 }} />
          </div>
        </div>

        <div className="perforation" />
      </div>
      <OverflowArt spec={spec} style={{ left: "4%", top: "-28%", width: "50%", height: "126%" }} />
    </div>
  );
}

/* ── Variant 4: "Grid" ──
   repeated portrait tiles behind big overflow art, chant headline strips
   top & bottom (bottom mirrored), white stub with triple script chant. */
export function GridTicket({ spec }: { spec: TicketSpec }) {
  const p = spec.palette;
  const tileImg = spec.artSrc ?? spec.iconSrc;
  const chant = `${spec.character.name.toUpperCase().split(" ")[0]}! `.repeat(3).trim();
  return (
    <div className="ticket">
      <div className="ticket-shadow" />
      <div className="ticket-shell" style={{ ["--ticket-clip" as string]: ticketClip(68) }}>
        <div className="main" style={{ background: p.base }}>
          <div style={{
            position: "absolute", inset: "12% 2%", display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "repeat(2, 1fr)",
            gap: 5, opacity: 0.6,
          }}>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} style={{ background: p.tint, borderRadius: 4, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={tileImg} alt="" loading="lazy"
                  onError={(e) => { e.currentTarget.src = fallbackIcon(spec.character); }}
                  style={{
                    width: "86%", height: "86%", objectFit: "contain",
                    borderRadius: spec.artSrc ? 0 : "50%",
                  }} />
              </div>
            ))}
          </div>
          {/* chant strips top & bottom (bottom flipped, like reference) */}
          <div className="t-cond" style={{
            position: "absolute", top: 0, left: 0, right: 0, zIndex: 4,
            background: `${p.deep}e6`, color: p.ink, textAlign: "center",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", padding: "3px 0",
          }}>
            {chant}
          </div>
          <div className="t-cond" style={{
            position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 4,
            background: `${p.deep}e6`, color: p.ink, textAlign: "center",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", padding: "3px 0",
            transform: "scaleY(-1)",
          }}>
            {chant}
          </div>
          <div className="t-zh" style={{
            position: "absolute", top: "13%", right: 8, zIndex: 5, fontWeight: 900,
            fontSize: "clamp(11px, 1.5vw, 15px)", color: "#fff", textShadow: `0 1.5px 0 ${p.deep}`,
            writingMode: "vertical-rl", letterSpacing: "0.2em",
          }}>
            {spec.zhName}特别演唱会
          </div>
        </div>

        <div className="stub" style={{ background: "#fdfbf5", color: "#241f18", padding: "10px 12px" }}>
          <div className="t-script" style={{ fontSize: "clamp(16px, 2.2vw, 22px)", color: p.base, lineHeight: 1.15, transform: "rotate(-1.5deg)" }}>
            {spec.character.name.split(" ")[0]}!<br />{spec.character.name.split(" ")[0]}!<br />{spec.character.name.split(" ")[0]}!
          </div>
          <div className="t-cond" style={{
            position: "absolute", top: 10, right: 8, writingMode: "vertical-rl",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: p.deep,
          }}>
            {fmtDate(spec.showDate)} 17:00
          </div>
          <div style={{ position: "absolute", bottom: 30, left: 12, display: "flex", gap: 8 }}>
            {[["AREA", spec.gate], ["ROW", spec.row], ["SEAT", spec.seat]].map(([k, v]) => (
              <div key={k} style={{ textAlign: "center" }}>
                <div className="t-cond" style={{ fontSize: 7, letterSpacing: "0.15em", color: "#8a7a61" }}>{k}</div>
                <div className="t-cond" style={{
                  fontWeight: 700, fontSize: 15, background: p.tint, color: p.deep,
                  borderRadius: 3, padding: "1px 7px",
                }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", bottom: 7, left: 12, right: 12 }}>
            <Barcode serial={spec.serial} color="#241f18" />
          </div>
        </div>

        <div className="perforation dark" />
      </div>
      {/* big centered art overflowing both top and bottom, like reference GUMI */}
      <OverflowArt spec={spec} style={{ left: "16%", top: "-22%", width: "46%", height: "132%" }} />
    </div>
  );
}