// Prompt templates for whole-ticket generation, one per variant, mirroring the
// four reference tickets (Miku Symphony / Teto Expo / vFlower World Tour / GUMI Grid).
// Each character's pose is grounded in their personality/lore (character-poses.mjs),
// not a generic template — microphone is not assumed.
import { poseForCharacter } from "./character-poses.mjs";

const PREAMBLE = (c, zh, hasIcon) => `Use your image_generation tool to generate ONE finished concert-ticket illustration, then save it into this project.

ATTACHED REFERENCES:
- Image 1 is the STYLE reference: a projectTiGER-style scrapbook of Vocaloid concert tickets. Match its exact illustration language: flat cel-shaded anime art, bold clean dark outlines, saturated FLAT colors (no 3D render, no soft gradients on the character), dynamic performance pose, printed-merch graphic-design feel.
${hasIcon ? "- Image 2 is the CHARACTER design anchor (official icon): the character MUST keep this exact hair color/style, eye color, outfit colors and signature accessories." : "- No official icon is attached for this newer character; design them faithfully from the description below in the same flat cel-shaded style, with an element-appropriate outfit and color scheme."}

CHARACTER: ${c.name} (${zh}) from Genshin Impact. ${c.description} Element: ${c.vision || "none (Traveler)"}. Nation: ${c.nation}.
POSE (must reflect this character's personality, NOT a generic idol pose): the character is ${"{POSE}"}. Render this exact gesture and temperament; do not default to holding a microphone.
`;

const OUTPUT = `
OUTPUT REQUIREMENTS:
- Pure solid WHITE (#FFFFFF) background OUTSIDE the ticket silhouette (so it can be cut out). The ticket fills most of the frame, centered, small white margin.
- The whole ticket is WIDE HORIZONTAL, aspect ratio about 2.3 : 1.
- The far LEFT and far RIGHT short edges are ZIGZAG torn/perforated edges (real ticket stock). A vertical dashed perforation separates main area and stub, with small semicircle punch-notches at its top and bottom.
- Crisp high-resolution flat vector-print look. NO watermark, NO objects outside the ticket. Render all specified text legibly and exactly.

STEPS:
1. Generate the image with the image generation tool.
2. Locate the generated file (tool result path, or newest file under C:\\Users\\flowerwine\\.codex\\generated_images).
3. Copy it to OUT_PATH (create directories; convert to PNG if needed).
4. Reply with the final absolute path only.`;

function symphony(c, s, zh, pose, hasIcon) {
  const p = s.palette;
  return `${PREAMBLE(c, zh, hasIcon).replace("{POSE}", pose)}
TICKET STYLE: the TOP reference ticket (black "Electric Symphony" Miku ticket), recolored to this character's element palette.
- LEFT ~68% MAIN area: pale tinted grid paper (background ${p.tint}, thin grid lines in ${p.deep} at low opacity) with a few faint translucent rounded UI rectangles and a subtle silhouette of ${c.nation} architecture. The character illustrated large center-left, upper-body/three-quarter, ${pose}, sparkles and music notes around. A bold BLACK horizontal title banner across the lower main area reading "${c.name} ${zh}" in heavy serif, with a small script line "${c.nation} Special Live" beneath. Tiny text "D:${(c.constellation || "VIATOR").toUpperCase().slice(0, 22)}" top-left and "//projectTEYVAT 2026" near the art.
- RIGHT ~32% STUB: deep ${p.deep} background, light ${p.ink} text. Top-right small "${s.serial}". Big serif date "${s.dateStr}", "${s.weekday} ${s.time}" beneath. Then "Row: ${s.row} | Seat: ${s.seat}". Bottom: a handwritten-script event logo in ${p.accent} reading "${(c.title || zh).split(" ").slice(0, 4).join(" ")}" with tiny "${c.name.toUpperCase()} SPECIAL LIVE" under it.
- Palette: tint ${p.tint}, base ${p.base}, deep ${p.deep}, accent ${p.accent}, black banner #1c1712.
${OUTPUT}`;
}

function expo(c, s, zh, pose, hasIcon) {
  const p = s.palette;
  const first = c.name.toUpperCase();
  return `${PREAMBLE(c, zh, hasIcon).replace("{POSE}", pose)}
TICKET STYLE: the SECOND reference ticket (red/white "TETO EXPO" ticket), recolored to this character's element palette.
- LEFT ~32% STUB: solid ${p.base} background, light ${p.ink} text. Top small "${s.serial.replace("No.", ".")}". Centered "ZONE: ${s.gate}" and "FREE STANDING" with a row of small diamonds beneath. A white QR-code square in the middle. Bottom bold "${first}✦ EXPO" and tiny "2026 WORLDWIDE".
- RIGHT ~68% MAIN area: clean white (#fdfbf5) background. A vertical ${p.base} date rail on the left edge reading "${s.dateStr} ${s.time}" (vertical text). A few white barcode blocks on a colored strip. The character illustrated large center, upper-body, ${pose}, gold/accent stars around. A small BLACK rounded badge top-right containing a tiny circular portrait and "//projectTEYVAT". Bottom-right: a handwritten-script name "${c.name}" in ${p.base}, a bold "${zh} EXPO✦" wordmark, tiny "2026 WORLDWIDE", and a barcode with "${s.serial}".
- Palette: base ${p.base}, deep ${p.deep}, accent ${p.accent}, ink ${p.ink}.
${OUTPUT}`;
}

function flower(c, s, zh, pose, hasIcon) {
  const p = s.palette;
  return `${PREAMBLE(c, zh, hasIcon).replace("{POSE}", pose)}
TICKET STYLE: the THIRD reference ticket (purple "vFlower World Tour" ticket), recolored to this character's element palette.
- LEFT ~68% MAIN area: diagonal gradient from ${p.base} to ${p.deep}. The character illustrated large left, upper-body/three-quarter, ${pose}, surrounded by floating petals/sparkles in ${p.accent} and a dotted arc trail. A diagonal dark ribbon across the lower area reading "✶ ${c.name}" in handwritten script (${p.accent}) with tiny "WORLD TOUR 2026" beneath. Vertical small "${s.serial}" on the left edge, tiny "//projectTEYVAT2026" top-right, a few white barcode blocks bottom-left.
- RIGHT ~32% STUB: deep ${p.deep} background, light ${p.ink} text. A vertical "✶ ADMIT ONE ✶" rail on its left edge (rotated text). Inside: tiny "World Tour" and big serif year "${s.dateStr.slice(0, 4)}", a large handwritten-script "${zh}" in ${p.accent}, then "GATE ${s.gate}  ROW ${s.row}  SEAT ${s.seat}" in serif, and a row of small diamonds at the bottom.
- Palette: base ${p.base}, deep ${p.deep}, accent ${p.accent}, ink ${p.ink}.
${OUTPUT}`;
}

function grid(c, s, zh, pose, hasIcon) {
  const p = s.palette;
  const first = c.name;
  const chant = `${first.toUpperCase()}! ${first.toUpperCase()}! ${first.toUpperCase()}!`;
  return `${PREAMBLE(c, zh, hasIcon).replace("{POSE}", pose)}
TICKET STYLE: the BOTTOM reference ticket (green "GUMI SPECIAL LIVE" ticket), recolored to this character's element palette.
- LEFT ~68% MAIN area: solid ${p.base} background with subtle sparkles/music-notes and a faint ${c.nation} motif — NO repeated portrait grid, just ONE single large character illustration. A bold chant strip across the TOP reading "${chant}" and a mirrored chant strip across the BOTTOM (light text on ${p.deep}). The character illustrated LARGE in the center, overflowing slightly above and below the ticket, drawn in the SAME normal anime proportions as the other reference tickets (NOT super-deformed/chibi — head about 1/5 of body height, like the Miku and Teto tickets), ${pose}. Vertical small "${zh}特别演唱会" on the right.
- RIGHT ~32% STUB: clean white (#fdfbf5) background, dark text. A handwritten-script triple chant "${first}! ${first}! ${first}!" in ${p.base} top-left. Vertical "${s.dateStr} ${s.time}" on the right edge. A boxed "AREA ${s.gate}  ROW ${s.row}  SEAT ${s.seat}" section (each value in a pale ${p.tint} box). A barcode with "${s.serial}" at the bottom.
- Palette: base ${p.base}, deep ${p.deep}, accent ${p.accent}, tint ${p.tint}.
${OUTPUT}`;
}

const BUILDERS = { symphony, expo, flower, grid };

export function buildPrompt(c, s, zh, outPath, hasIcon = true) {
  const pose = poseForCharacter(c.slug, s.seed);
  return BUILDERS[s.variant](c, s, zh, pose, hasIcon).replaceAll("OUT_PATH", outPath);
}