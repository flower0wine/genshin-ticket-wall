// Process completed grid-regen tickets (PNGs whose slug logged "ok" in grid logs).
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
const DIR = path.resolve("public/tickets");
const done = new Set();
for (const n of ["grid0", "grid1", "grid2"]) {
  const l = `gen/${n}.log`;
  if (!existsSync(l)) continue;
  for (const m of readFileSync(l, "utf8").matchAll(/^ok (\S+)$/gm)) done.add(m[1]);
}
const pending = readdirSync(DIR).filter((f) => f.endsWith(".png")).map((f) => f.replace(/\.png$/, "")).filter((s) => done.has(s));
if (!pending.length) { console.log("nothing pending"); process.exit(0); }
console.log("processing:", pending.join(" "));
spawnSync(process.execPath, ["scripts/process-tickets.mjs", ...pending], { stdio: "inherit" });