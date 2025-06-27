import { describe, it, expect } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  queryUpstream,
  queryService,
  queryPackage,
  queryInput,
} from "@oomol/oocana";

const __dirname = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const executorBin = path.join(__dirname, "..", "packages", "executor", "dist");
process.env["PATH"] = `${executorBin}:${process.env["PATH"]}}`;

describe(
  "query test",
  {
    timeout: 20 * 1000,
  },
  () => {
    it("query upstream", async () => {
      const res = await queryUpstream({
        flowPath: path.join(__dirname, "flows", "pkg", "flow.oo.yaml"),
        searchPaths: [
          path.join(__dirname, "blocks"),
          path.join(__dirname, "packages"),
        ].join(","),
        nodes: ["c"],
      });
      expect(res).toEqual({
        willRunNodes: ["a"],
        waitingNodes: [],
        upstreamNodes: ["a"],
        flowPath: path.join(__dirname, "flows", "pkg", "flow.oo.yaml"),
      });
    });

    it("query service", async () => {
      const res = await queryService({
        flowPath: path.join(__dirname, "flows", "service", "flow.oo.yaml"),
        searchPaths: [
          path.join(__dirname, "blocks"),
          path.join(__dirname, "packages"),
        ].join(","),
      });

      expect(res.length).toBe(1);
      expect(res[0].entry).toBe("./index.ts");
    });

    it("query package", async () => {
      const cli = await queryPackage({
        flowPath: path.join(__dirname, "flows", "triple", "flow.oo.yaml"),
        searchPaths: [
          path.join(__dirname, "blocks"),
          path.join(__dirname, "packages"),
        ].join(","),
      });

      expect(Object.keys(cli).length).toBe(2);
    });

    it("query flow absence input", async () => {
      const result = await queryInput({
        flowPath: path.join(__dirname, "flows", "absence", "flow.oo.yaml"),
        searchPaths: [
          path.join(__dirname, "blocks"),
          path.join(__dirname, "packages"),
        ].join(","),
      });

      expect(result).toEqual({
        "node-1": [
          {
            handle: "input",
          },
        ],
        "node-2": [
          {
            handle: "input",
          },
        ],
      });
    });
  }
);
