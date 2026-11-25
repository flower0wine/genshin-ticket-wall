// Process only tickets whose generation has completed ("ok <slug>" in a batch
// log) and still have a pending PNG. Safe to run while batches are generating.
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";

const DIR = path.resolve("public/tickets");
const logs = ["p0", "p1", "p2", "g0", "g1", "g2", "tk0", "tk1", "tk2", "tk3"].map((n) => `gen/${n}.log`);
const done = new Set();
for (const l of logs) {
  if (!existsSync(l)) continue;
  for (const m of readFileSync(l, "utf8").matchAll(/^ok (\S+)$/gm)) done.add(m[1]);
}
const pending = readdirSync(DIR).filter((f) => f.endsWith(".png"))
  .map((f) => f.replace(/\.png$/, "")).filter((s) => done.has(s));
if (!pending.length) { console.log("nothing completed pending"); process.exit(0); }
console.log(`processing: ${pending.join(" ")}`);
const r = spawnSync(process.execPath, ["scripts/process-tickets.mjs", ...pending], { stdio: "inherit" });
process.exit(r.status ?? 0);