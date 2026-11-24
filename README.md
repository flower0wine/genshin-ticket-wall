# 提瓦特巡演票墙 · Teyvat Ticket Wall

> [Delusional] Concert Tickets Addendum — 原神全角色，每人一场专属演唱会。

一个致敬 Vocaloid 演唱会门票拼贴画（projectTiGER 风格）的粉丝项目：软木板背景上钉满**原神全角色**的演唱会门票，每张票由角色的元素配色、生日/实装日期、命之座与专属插画数据驱动生成。

**在线预览**: https://flower0wine.github.io/genshin-ticket-wall/

![preview](docs/preview.png)

## 元素构成 — 什么用代码，什么用生图

参考图的每个视觉元素都有明确的实现归属：

| 元素 | 实现方式 | 位置 |
| --- | --- | --- |
| 软木板点纹背景 | CSS `radial-gradient` 双层点阵 | `src/styles/wall.css` |
| 顶部螺旋线圈装订 | CSS 渐变 + `repeat-x` | `.spiral` |
| 票体 / 撕票线 / 半圆打孔 | CSS flex + dashed border + 圆形遮罩 | `src/components/decor.tsx` |
| 条形码 | CSS `repeating-linear-gradient` | `Barcode` |
| 二维码 | `qrcode.react` SVG（编码角色票号 URI） | `ExpoTicket` |
| 印章（做旧圆章） | SVG turbulence mask | `Stamp` |
| 和纸胶带（条纹/波点） | CSS 渐变 + `clip-path` | `Tape` |
| 星星 / 花瓣 / 音符装饰 | 内联 SVG，种子随机布局 | `Sparkles` |
| 日期 / 排号 / 座位 / 序列号 | 由角色数据确定性派生（FNV-1a + mulberry32） | `src/data/index.ts` |
| **角色 chibi 演唱会立绘** | **AI 生图**（codex `image_generation`，白底转透明） | `public/art/*-stage.png` |
| 角色头像兜底 | 官方图标（genshin.dev 数据仓库） | `public/icons/*.png` |

原则：**几何、纹理、排版全部代码生成**（可维护、可缩放、零图片体积）；**只有角色插画用生图**（无法用代码表达的部分）。没有生成插画的角色自动回退到官方圆形头像，页面永远完整。

## 四种票面版式

对应参考图的四张票，按角色 slug 哈希确定性分配：

- **Symphony** — 深色票根 + 手写体标题横幅（Electric Symphony 式）
- **Expo** — 彩色左根 + 二维码 + 白底主票（TETO EXPO 式）
- **Flower** — ADMIT ONE 竖排轨 + 斜置姓名缎带（v Flower 式）
- **Grid** — 重复头像网格 + 大幅立绘（GUMI 式）

## 技术栈

- React 19 + TypeScript (strict) + Vite 8
- pnpm · ESLint 9 flat config · Vitest
- `qrcode.react`（SVG 二维码）· `sharp`（生图后处理，dev-only）
- 无 UI 框架 — 票面全部手写 CSS/SVG，保证拼贴质感
- GitHub Pages 自动部署（`.github/workflows/deploy.yml`）

## 开发

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm test         # 数据层单测
pnpm lint
pnpm build        # 产物 dist/
```

## 数据与生图管线

```bash
pnpm data:sync                      # 从 genshindev/api 拉取全角色元数据 → src/data/characters.json
node scripts/fetch-icons.mjs        # 官方头像兜底 → public/icons/
node scripts/gen-art.mjs furina     # codex image_gen 生成 chibi 演唱会立绘（需已登录 codex CLI）
node scripts/gen-art.mjs --all-missing   # 批量补全所有缺失插画
node scripts/optimize-art.mjs       # 裁白边 + 缩至 900px
node scripts/alpha-art.mjs          # 泛洪填充白底 → 透明 PNG
```

新角色上线时：在 `src/data/zh-names.ts` 的 `EXTRA_CHARACTERS` 追加条目（或等上游更新后 `pnpm data:sync`），跑一遍生图管线即可，无需改任何组件。

测试参考流程（本项目首个角色）：用 [ego-browser](https://ego.app) 在 Pinterest 搜索 `genshin impact furina chibi concert` 挑选画风参考 → 以官方图标锚定角色设计 → codex `image_generation` 生成白底方图 → 泛洪去底 → 入票。

## 目录结构

```
├── scripts/            # 数据同步 / 图标下载 / 生图 / 图片后处理
├── src/
│   ├── data/           # characters.json + 中文名与新增角色 + 票面规格派生
│   ├── components/     # tickets.tsx 四版式 · decor.tsx 装饰件 · TicketCard · DetailModal
│   └── styles/         # wall.css 软木板与票面样式
└── public/
    ├── art/            # AI 生成插画（透明 PNG）
    └── icons/          # 官方头像兜底
```

## 版权与致谢

- 粉丝作品，非官方。Genshin Impact © HoYoverse/miHoYo，角色设计与官方图标版权归米哈游。
- 角色元数据来自 [genshindev/api](https://github.com/genshindev/api)。
- 拼贴创意致敬 projectTiGER 2023 的 Vocaloid 门票附录插画。
- 代码以 MIT 许可开源；`public/art` 内 AI 生成图随仓库以 CC0 提供。