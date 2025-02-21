import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/bin.ts", "src/service/service.ts"],
  format: ["cjs"],
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
});
