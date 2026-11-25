// Check which tickets still have their original generated PNG in codex cache.
import { readdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";
const CACHE = "C:/Users/flowerwine/.codex/generated_images";
const tickets = readdirSync("public/tickets").filter((f) => f.endsWith(".webp")).map((f) => f.replace(/\.webp$/, ""));
// map: find newest png per exec dir; we can't know slug directly, so just count dirs
const dirs = readdirSync(CACHE).filter((d) => existsSync(path.join(CACHE, d)));
console.log("cache dirs:", dirs.length, "tickets:", tickets.length);
// Instead: re-generate is cleaner. Just report tickets list for regen planning.
console.log(tickets.join(" "));