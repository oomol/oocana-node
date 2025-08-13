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
      const subEvents = r[0].events;
      const latestFinished = subEvents
        .filter(e => e.event === "BlockFinished")
        .pop();
      expect(latestFinished).not.toBeUndefined();
      expect(
        latestFinished?.data.stacks[latestFinished.data.stacks.length - 1]
          .node_id
      ).toBe("end");
    });
  },
  {
    timeout: 1000 * 20,
  }
);
