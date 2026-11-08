import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The normal website keeps its public assets. This export embeds them so the
// downloaded HTML also works under file://, with no server or network access.
const imagesDir = fileURLToPath(new URL("./public/images/", import.meta.url));
const images = readdirSync(imagesDir)
  .filter((name) => /\.(svg|webp|jpe?g|png|avif)$/i.test(name))
  .map((name) => ({
    name,
    data: `data:image/${{ svg: "svg+xml", jpg: "jpeg" }[name.split(".").at(-1).toLowerCase()] || name.split(".").at(-1).toLowerCase()};base64,${readFileSync(new URL(`./public/images/${name}`, import.meta.url)).toString("base64")}`,
  }));
const favicon = `data:image/svg+xml;base64,${readFileSync(new URL("./public/favicon.svg", import.meta.url)).toString("base64")}`;

export default defineConfig({
  plugins: [
    {
      name: "embed-public-illustrations",
      enforce: "pre",
      transform(code, id) {
        if (!id.includes("/src/") || !/\.[jt]sx?$/.test(id)) return;
        let result = code;
        for (const { name, data } of images) {
          const literal = new RegExp(
            `(["'])/images/${name.replaceAll(".", "\\.")}\\1`,
            "g",
          );
          result = result.replace(literal, () => JSON.stringify(data));
        }
        return result === code ? undefined : { code: result, map: null };
      },
      transformIndexHtml(html) {
        return html.replace('href="/favicon.svg"', `href="${favicon}"`);
      },
    },
    react(),
    viteSingleFile(),
  ],
  define: { "import.meta.env.VITE_STANDALONE": JSON.stringify("true") },
  build: { outDir: "dist-standalone", copyPublicDir: false, emptyOutDir: true },
});
