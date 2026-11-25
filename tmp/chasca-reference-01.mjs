const task = await taskSpace("Chasca concert ticket reference");
const page = task.page("p1");
console.log({ taskSpaceId: task.spaceId });
await page.goto("https://library.keqingmains.com/img/characters/round-icon/Chasca.png", { timeout: 30000 });
const response = await page.fetch("https://library.keqingmains.com/img/characters/round-icon/Chasca.png", { saveAs: "C:/develop/genshin-ticket-wall/refs/chasca-official-icon.png", timeout: 10000 });
console.log({ ok: response.ok, status: response.status });
