import { dts } from "rollup-plugin-dts";
import type { RollupOptions } from "rollup";

const config: RollupOptions = {
  input: "./src/index.ts",
  output: [{ file: "dist/index.d.ts", format: "es" }],
  plugins: [dts()],
};

const external: RollupOptions = {
  input: "./src/external/index.ts",
  output: [{ file: "dist/oocana.d.ts", format: "es" }],
  plugins: [dts()],
};

export default [config, external];
