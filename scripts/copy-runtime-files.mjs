import { mkdir, cp } from "node:fs/promises";

await mkdir("dist/config", { recursive: true });
await mkdir("dist/assets", { recursive: true });

await cp("src/config", "dist/config", {
  recursive: true,
  filter: (src) => src.endsWith(".json") || !src.includes("."),
});

await cp("src/assets", "dist/assets", {
  recursive: true,
});

console.log("Runtime files copied to dist.");
