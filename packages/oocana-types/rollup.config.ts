import { dts } from "rollup-plugin-dts";
import type { RollupOptions } from "rollup";

const config: RollupOptions = {
  input: "./src/index.ts",
  output: [{ file: "dist/index.d.ts", format: "es" }],
  plugins: [dts({ respectExternal: true })],
};

const external: RollupOptions = {
  input: "./src/external/index.ts",
  output: [{ file: "dist/oocana.d.ts", format: "es" }],
  plugins: [dts({ respectExternal: true })],
};

export default [config, external];
