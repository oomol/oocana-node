import { it, expect, describe } from "vitest";
import { runFlow } from "./run";

describe(
  "concurrency test",
  () => {
    it("run two flow", async () => {
      const r = await Promise.all([runFlow("sub"), runFlow("pkg")]);
      for (const { code, events } of r) {
        expect(code).toBe(0);
      }
    });
  },
  {
    timeout: 1000 * 20,
  }
);
