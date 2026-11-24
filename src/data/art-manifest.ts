// Build-time art manifest: every public/art/<slug>-stage.png becomes an entry.
// Files live in public/, so URLs are plain BASE_URL paths (no bundler processing).
// Adding a new PNG + rebuilding is all it takes to register new art.
const modules = import.meta.glob("../../public/art/*-stage.png", { query: "?url", import: "default" });

export const ART_MANIFEST: Record<string, string> = Object.fromEntries(
  Object.keys(modules).map((path) => {
    const file = path.split("/").pop()!;
    const slug = file.replace(/-stage\.png$/, "");
    return [slug, `${import.meta.env.BASE_URL}art/${file}`];
  }),
);