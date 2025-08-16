import { describe, it, expect } from "vitest";
import path from "node:path";
import {
  queryUpstream,
  queryService,
  queryPackage,
  queryNodesInputs,
  queryInputs,
} from "@oomol/oocana";
import { flow_examples, packages, workspace } from "./run";

const executorBin = path.join(
  flow_examples,
  "..",
  "packages",
  "executor",
  "dist"
);
process.env["PATH"] = `${executorBin}:${process.env["PATH"]}}`;

describe(
  "query test",
  {
    timeout: 20 * 1000,
  },
  () => {
    it("query upstream", async () => {
      const res = await queryUpstream({
        flowPath: path.join(workspace, "flows", "pkg", "flow.oo.yaml"),
        searchPaths: [packages].join(","),
        nodes: ["c"],
      });
      expect(res).toEqual({
        willRunNodes: ["a"],
        waitingNodes: [],
        upstreamNodes: ["a"],
        flowPath: path.join(workspace, "flows", "pkg", "flow.oo.yaml"),
      });
    });

    it("query service", async () => {
      const res = await queryService({
        flowPath: path.join(workspace, "flows", "service", "flow.oo.yaml"),
        searchPaths: [packages].join(","),
      });

      expect(res.length).toBe(1);
      expect(res[0].entry).toBe("./index.ts");
    });

    it("query package", async () => {
      const cli = await queryPackage({
        flowPath: path.join(workspace, "flows", "triple", "flow.oo.yaml"),
        searchPaths: [packages].join(","),
      });

      expect(Object.keys(cli).length).toBe(2);
    });

    it("query flow nodes inputs", async () => {
      const result = await queryNodesInputs({
        flowPath: path.join(workspace, "flows", "absence", "flow.oo.yaml"),
        searchPaths: [packages].join(","),
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

    it("query inputs", async () => {
      const result = await queryInputs({
        path: path.join(workspace, "subflows", "basic", "subflow.oo.yaml"),
        searchPaths: [packages].join(","),
      });

      expect(result).toEqual({
        input: {
          handle: "input",
          description: "Input",
          json_schema: {
            type: "string",
          },
        },
      });
    });
  }
);
