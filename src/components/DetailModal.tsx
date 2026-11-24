import type { TicketSpec } from "../types";
import { fallbackIcon } from "../data";

const fmtDate = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

export function DetailModal({ spec, onClose }: { spec: TicketSpec; onClose: () => void }) {
  const c = spec.character;
  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={`${spec.zhName} 详情`}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="关闭">✕</button>
        <h2>{spec.zhName}</h2>
        <div className="en">{c.name} — {c.title}</div>
        <div style={{ display: "flex", gap: 22, alignItems: "center", margin: "14px 0" }}>
          <img
            src={spec.artSrc ?? spec.iconSrc}
            alt={spec.zhName}
            onError={(e) => { e.currentTarget.src = fallbackIcon(c); }}
            style={{
              width: 132, height: 132, objectFit: "contain",
              borderRadius: spec.artSrc ? 8 : "50%",
              background: spec.palette.tint, padding: 6,
            }}
          />
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "#5c5140" }}>{c.description}</p>
        </div>
        <div className="modal-meta">
          <div><b>元素 Vision</b>{c.vision || "旅行者（无神之眼）"}</div>
          <div><b>武器 Weapon</b>{c.weapon}</div>
          <div><b>地区 Nation</b>{c.nation}</div>
          <div><b>所属 Affiliation</b>{c.affiliation || "—"}</div>
          <div><b>稀有度 Rarity</b>{"★".repeat(c.rarity)}</div>
          <div><b>命之座 Constellation</b>{c.constellation || "—"}</div>
          <div><b>实装 Release</b>{c.release ?? "—"}</div>
          <div><b>演出日 Show Date</b>{fmtDate(spec.showDate)} 19:30</div>
          <div><b>票号 Serial</b>{spec.serial}</div>
          <div><b>入场 Gate / Row / Seat</b>{spec.gate} / {spec.row} / {spec.seat}</div>
        </div>
        <div style={{ fontSize: 12, color: "#9a8a6e" }}>
          {spec.artSrc ? "票面插画：AI 生成 chibi 演唱会立绘" : "票面头像：官方角色图标（genshin.dev）— 运行 pnpm art:batch 可生成专属插画"}
        </div>
      </div>
    </div>
  );
}