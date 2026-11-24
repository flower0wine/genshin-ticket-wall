// Build-time manifest of generated whole-ticket illustrations (alpha WebP).
// Files live in public/tickets/, served at BASE_URL paths. Adding a new WebP
// + rebuilding registers it automatically; characters without one fall back
// to the data-driven CSS ticket.
const modules = import.meta.glob("../../public/tickets/*.webp", { query: "?url", import: "default" });

export const TICKET_MANIFEST: Record<string, string> = Object.fromEntries(
  Object.keys(modules).map((p) => {
    const file = p.split("/").pop()!;
    const slug = file.replace(/\.webp$/, "");
    return [slug, `${import.meta.env.BASE_URL}tickets/${file}`];
  }),
);