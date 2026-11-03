import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

// GitHub Pages liefert unter https://<name>.github.io/<repo>/ aus.
// PAGES_BASE überschreibt das, z. B. "/" für eine eigene Domain.
const base = process.env.PAGES_BASE ?? "/Famicura/";

// Die App verweist fest auf /brand/… ; unter einem Unterpfad muss der Basis-Pfad davor.
function brandPaths(): Plugin {
  return {
    name: "famicura-pages-brand-paths",
    enforce: "pre",
    transform(code, id) {
      if (base === "/" || id.includes("node_modules") || !/\.(tsx?|css)$/.test(id)) return;
      return code.replace(/(["'(])\/brand\//g, `$1${base}brand/`);
    },
    transformIndexHtml: (html) => html.replace(/"\/brand\//g, `"${base}brand/`),
  };
}

export default defineConfig({
  root: "pages",
  base,
  publicDir: "../public",
  plugins: [brandPaths(), react()],
  build: { outDir: "../dist-pages", emptyOutDir: true },
});
