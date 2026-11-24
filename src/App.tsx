import { useMemo, useState } from "react";
import { CHARACTERS, paletteFor, ticketSpec } from "./data";
import { ART_MANIFEST } from "./data/art-manifest";
import type { TicketSpec } from "./types";
import { TicketCard } from "./components/TicketCard";
import { DetailModal } from "./components/DetailModal";
import { BoardScraps } from "./components/BoardScraps";
import "./styles/wall.css";

const NATIONS = ["全部", "Mondstadt", "Liyue", "Inazuma", "Sumeru", "Fontaine", "Natlan", "Nod-Krai", "Snezhnaya", "Otherworld", "Outlander"];
const NATION_ZH: Record<string, string> = {
  全部: "全部", Mondstadt: "蒙德", Liyue: "璃月", Inazuma: "稻妻", Sumeru: "须弥",
  Fontaine: "枫丹", Natlan: "纳塔", "Nod-Krai": "挪德卡莱", Snezhnaya: "至冬",
  Otherworld: "异界", Outlander: "旅行者",
};
const VISIONS = ["Pyro", "Hydro", "Anemo", "Electro", "Dendro", "Cryo", "Geo"];
const VISION_ZH: Record<string, string> = {
  Pyro: "火", Hydro: "水", Anemo: "风", Electro: "雷", Dendro: "草", Cryo: "冰", Geo: "岩",
};

export default function App() {
  const [nation, setNation] = useState("全部");
  const [vision, setVision] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<TicketSpec | null>(null);

  const specs = useMemo(() => CHARACTERS.map((c) => ticketSpec(c, ART_MANIFEST)), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return specs.filter((s) => {
      if (nation !== "全部" && s.character.nation !== nation) return false;
      if (vision && s.character.vision !== vision) return false;
      if (q && !(
        s.zhName.includes(q) ||
        s.character.name.toLowerCase().includes(q) ||
        s.character.slug.includes(q)
      )) return false;
      return true;
    });
  }, [specs, nation, vision, query]);

  return (
    <>
      <div className="spiral" aria-hidden />
      <header className="masthead">
        <h1>提瓦特巡演票墙</h1>
        <div className="sub">[Delusional] Teyvat Concert Tickets Addendum — every character, one live</div>
        <div className="count">{CHARACTERS.length} characters · {Object.keys(ART_MANIFEST).length} generated arts · ./projectTEYVAT 2026</div>
      </header>

      <nav className="filters" aria-label="角色筛选">
        {NATIONS.map((n) => (
          <button
            key={n}
            className={`chip ${nation === n ? "active" : ""}`}
            style={nation === n ? { background: "#5c4f3d" } : undefined}
            onClick={() => setNation(n)}
          >
            {NATION_ZH[n]}
          </button>
        ))}
        <span style={{ width: 1, height: 22, background: "#d8cdbb", margin: "0 4px" }} />
        {VISIONS.map((v) => {
          const p = paletteFor(v);
          const active = vision === v;
          return (
            <button
              key={v}
              className={`chip ${active ? "active" : ""}`}
              style={active ? { background: p.deep } : undefined}
              onClick={() => setVision(active ? null : v)}
              aria-pressed={active}
            >
              <span className="dot" style={{ background: p.base }} />
              {VISION_ZH[v]}
            </button>
          );
        })}
        <input
          className="searchbox"
          placeholder="搜索角色 / search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="搜索角色"
        />
      </nav>

      <div className="board">
        <BoardScraps />
        <main className="wall">
          {filtered.map((spec) => (
            <TicketCard key={spec.character.slug} spec={spec} onOpen={setOpen} />
          ))}
          {filtered.length === 0 && (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#7c6c54" }}>
              没有匹配的角色 — 试试别的筛选条件？
            </p>
          )}
        </main>
      </div>

      <footer className="colophon">
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          maxWidth: 1280, margin: "0 auto 18px", padding: "0 12px",
        }}>
          <span className="t-script" style={{ fontSize: 26, color: "#4a4036", transform: "rotate(-2deg)", display: "inline-block" }}>
            [Delusional] Concert Tickets Addendum
          </span>
          <span className="t-cond" style={{ fontSize: 12, letterSpacing: "0.2em", color: "#6e5f4b", transform: "rotate(1deg)", display: "inline-block" }}>
            //projectTEYVAT 2026
          </span>
        </div>
        fan-made collage · data from{" "}
        <a href="https://github.com/genshindev/api" target="_blank" rel="noreferrer">genshin.dev</a> · art generated with AI ·
        Genshin Impact © HoYoverse ·{" "}
        <a href="https://github.com/flower0wine/genshin-ticket-wall" target="_blank" rel="noreferrer">source on GitHub</a>
      </footer>

      {open && <DetailModal spec={open} onClose={() => setOpen(null)} />}
    </>
  );
}